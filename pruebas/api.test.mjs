// Pruebas de integración del API de ReservaUPLA.
// Requisitos: backend en ejecución (http://localhost:5100) y Node.js 18 o superior.
// Uso:  node pruebas/api.test.mjs
// Cada prueba indica la regla (RF / RN / RV / SEG) que verifica.

const URL_API = process.env.API_URL || 'http://localhost:5100';
const CLAVE_DEMO = 'Upla2026!';

let aprobadas = 0;
let fallidas = 0;

// ---------- utilidades ----------
async function llamar(metodo, ruta, cuerpo, token) {
  const encabezados = { 'Content-Type': 'application/json' };
  if (token) encabezados['Authorization'] = 'Bearer ' + token;
  const respuesta = await fetch(URL_API + ruta, {
    method: metodo,
    headers: encabezados,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let datos = null;
  try { datos = await respuesta.json(); } catch { datos = null; }
  return { estado: respuesta.status, datos };
}
const igual = (real, esperado, detalle) => {
  if (real !== esperado) throw new Error(`${detalle}: se esperaba "${esperado}" y se obtuvo "${real}"`);
};
const verdadero = (condicion, detalle) => { if (!condicion) throw new Error(detalle); };

async function probar(codigo, descripcion, funcion) {
  try {
    await funcion();
    aprobadas++;
    console.log(`APROBADO | ${codigo} | ${descripcion}`);
  } catch (error) {
    fallidas++;
    console.log(`FALLIDO  | ${codigo} | ${descripcion} -> ${error.message}`);
  }
}

function fechaFutura(dias) {
  const f = new Date();
  f.setDate(f.getDate() + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}
const base = 200 + Math.floor(Math.random() * 700);
let desplazamiento = 0;
const nuevaFecha = () => fechaFutura(base + desplazamiento++);

async function iniciarSesion(correo) {
  const r = await llamar('POST', '/api/auth/login', { correo, contrasena: CLAVE_DEMO });
  if (r.estado !== 200) throw new Error('No se pudo iniciar sesión con ' + correo);
  return r.datos;
}

// ---------- sesiones de partida ----------
const sAdmin = await iniciarSesion('rmedina@upla.edu.pe');
const sAna = await iniciarSesion('atorres@upla.edu.pe');
const sLuis = await iniciarSesion('lhuaman@upla.edu.pe');
const sResp = await iniciarSesion('cquispe@upla.edu.pe');
const tAdmin = sAdmin.token, tAna = sAna.token, tLuis = sLuis.token, tResp = sResp.token;

const ambientes = (await llamar('GET', '/api/ambientes', null, tAdmin)).datos;
const lab = ambientes.find((a) => a.nombre === 'Laboratorio de Cómputo 1');
const otroLab = ambientes.find((a) => a.nombre === 'Laboratorio de Cómputo 2');
const sala = ambientes.find((a) => a.nombre === 'Sala de Reuniones 1');
const mantenimiento = ambientes.find((a) => a.estado === 'Mantenimiento');

const datosReserva = (fecha, inicio, fin, extra = {}) => ({ fecha, horaInicio: inicio, horaFin: fin, motivo: 'Prueba automática', ambienteId: lab.id, ...extra });
const crearReserva = (fecha, inicio, fin, extra = {}, token = tAna) => llamar('POST', '/api/reservas', datosReserva(fecha, inicio, fin, extra), token);

console.log('=== Pruebas del API de ReservaUPLA ===');

// ---------- SEG: inicio de sesión y permisos ----------
await probar('SEG-01', 'Inicio de sesión correcto devuelve token, rol y datos del usuario', async () => {
  igual(sAna.usuario.rol, 'Solicitante', 'rol');
  verdadero(sAna.token.split('.').length === 3, 'el token no tiene formato JWT');
  verdadero(!JSON.stringify(sAna).includes('contrasenaHash'), 'se expuso el hash de la contraseña');
});
await probar('SEG-02', 'Contraseña errónea y correo inexistente devuelven el MISMO mensaje (401)', async () => {
  const mala = await llamar('POST', '/api/auth/login', { correo: 'atorres@upla.edu.pe', contrasena: 'Incorrecta1' });
  const inexistente = await llamar('POST', '/api/auth/login', { correo: 'nadie@upla.edu.pe', contrasena: 'Incorrecta1' });
  igual(mala.estado, 401, 'estado (contraseña errónea)');
  igual(inexistente.estado, 401, 'estado (correo inexistente)');
  igual(mala.datos.mensaje, inexistente.datos.mensaje, 'mensajes');
});
await probar('SEG-03', 'Login con campos vacíos o correo mal escrito devuelve 400 con errores por campo', async () => {
  const vacio = await llamar('POST', '/api/auth/login', { correo: '', contrasena: '' });
  igual(vacio.estado, 400, 'estado');
  verdadero(vacio.datos.errores.correo && vacio.datos.errores.contrasena, 'faltan errores por campo');
  const formato = await llamar('POST', '/api/auth/login', { correo: 'ana@', contrasena: 'x' });
  verdadero(formato.datos.errores.correo, 'falta el error de formato');
});
await probar('SEG-04', 'Tras 5 intentos fallidos el correo se bloquea temporalmente (429)', async () => {
  const correo = `bloqueo${Date.now()}@upla.edu.pe`;
  for (let i = 0; i < 5; i++) await llamar('POST', '/api/auth/login', { correo, contrasena: 'Incorrecta1' });
  const sexto = await llamar('POST', '/api/auth/login', { correo, contrasena: 'Incorrecta1' });
  igual(sexto.estado, 429, 'estado');
  verdadero(/minuto/.test(sexto.datos.mensaje), 'el mensaje no indica el tiempo de espera');
});
await probar('SEG-05', 'Sin token, con token alterado o con token falso se recibe 401', async () => {
  igual((await llamar('GET', '/api/reservas')).estado, 401, 'sin token');
  igual((await llamar('GET', '/api/reservas', null, 'token.falso.aqui')).estado, 401, 'token falso');
  const partes = tAna.split('.');
  const carga = JSON.parse(Buffer.from(partes[1], 'base64url').toString());
  carga.role = 'Administrador';
  const alterado = `${partes[0]}.${Buffer.from(JSON.stringify(carga)).toString('base64url')}.${partes[2]}`;
  igual((await llamar('GET', '/api/usuarios', null, alterado)).estado, 401, 'token con rol alterado');
});
await probar('SEG-06', 'La sesión actual se recupera con /api/auth/me', async () => {
  const r = await llamar('GET', '/api/auth/me', null, tAna);
  igual(r.estado, 200, 'estado');
  igual(r.datos.correo, 'atorres@upla.edu.pe', 'correo');
});
await probar('SEG-07', 'Un solicitante no puede administrar usuarios ni ambientes (403)', async () => {
  igual((await llamar('GET', '/api/usuarios', null, tAna)).estado, 403, 'listar usuarios');
  igual((await llamar('POST', '/api/ambientes', { nombre: 'X', tipo: 'Auditorio', capacidad: 5, ubicacion: 'Y' }, tAna)).estado, 403, 'crear ambiente');
});

// ---------- RF-01 usuarios ----------
await probar('RF-01', 'El administrador registra un usuario válido y este puede iniciar sesión', async () => {
  const correo = `prueba${Date.now()}@upla.edu.pe`;
  const r = await llamar('POST', '/api/usuarios', { nombreCompleto: 'Usuario de Prueba', correo, rol: 'Solicitante', contrasena: 'Prueba2026' }, tAdmin);
  igual(r.estado, 201, 'estado');
  const login = await llamar('POST', '/api/auth/login', { correo, contrasena: 'Prueba2026' });
  igual(login.estado, 200, 'inicio de sesión del nuevo usuario');
});
await probar('RF-01 / RV', 'Usuario con datos vacíos devuelve 400 con errores por campo', async () => {
  const r = await llamar('POST', '/api/usuarios', { nombreCompleto: '', correo: '', rol: '', contrasena: '' }, tAdmin);
  igual(r.estado, 400, 'estado');
  verdadero(r.datos.errores.nombreCompleto && r.datos.errores.correo && r.datos.errores.rol && r.datos.errores.contrasena, 'faltan errores por campo');
});
await probar('RF-01 / RV', 'Contraseña débil o correo inválido o repetido devuelven 400', async () => {
  const debil = await llamar('POST', '/api/usuarios', { nombreCompleto: 'Ana', correo: 'otra@upla.edu.pe', rol: 'Solicitante', contrasena: 'abc' }, tAdmin);
  verdadero(debil.estado === 400 && debil.datos.errores.contrasena, 'contraseña débil');
  const correoMal = await llamar('POST', '/api/usuarios', { nombreCompleto: 'Ana', correo: 'ana@', rol: 'Solicitante', contrasena: 'Valida2026' }, tAdmin);
  verdadero(correoMal.estado === 400 && correoMal.datos.errores.correo, 'correo inválido');
  const repetido = await llamar('POST', '/api/usuarios', { nombreCompleto: 'Otra', correo: 'ATORRES@upla.edu.pe', rol: 'Solicitante', contrasena: 'Valida2026' }, tAdmin);
  verdadero(repetido.estado === 400 && repetido.datos.errores.correo, 'correo repetido');
});

// ---------- RF-02 ambientes ----------
await probar('RF-02', 'El administrador registra un ambiente válido (queda Disponible)', async () => {
  const r = await llamar('POST', '/api/ambientes', { nombre: `Aula de prueba ${Date.now()}`, tipo: 'Sala de reuniones', capacidad: 15, ubicacion: 'Pabellón D', responsableId: sResp.usuario.id }, tAdmin);
  igual(r.estado, 201, 'estado');
  igual(r.datos.estado, 'Disponible', 'estado del ambiente');
});
await probar('RF-02 / RV', 'Ambiente con datos inválidos o nombre repetido devuelve 400', async () => {
  const mal = await llamar('POST', '/api/ambientes', { nombre: '', tipo: 'Auditorio', capacidad: 0, ubicacion: 'X' }, tAdmin);
  verdadero(mal.estado === 400 && mal.datos.errores.nombre && mal.datos.errores.capacidad, 'datos inválidos');
  const repetido = await llamar('POST', '/api/ambientes', { nombre: lab.nombre, tipo: 'Auditorio', capacidad: 10, ubicacion: 'X' }, tAdmin);
  verdadero(repetido.estado === 400 && repetido.datos.errores.nombre, 'nombre repetido');
});

// ---------- RF-03 y reglas RN-02, RN-03, RN-04 ----------
await probar('RF-03', 'Un solicitante registra una reserva válida: queda Pendiente y a su nombre', async () => {
  const r = await crearReserva(nuevaFecha(), '08:00', '10:00');
  igual(r.estado, 201, 'estado');
  igual(r.datos.estado, 'Pendiente', 'estado de la reserva');
  igual(r.datos.solicitanteNombre, sAna.usuario.nombreCompleto, 'solicitante');
});
await probar('RN-02', 'Una reserva sin datos devuelve 400 con un error por cada dato faltante', async () => {
  const r = await llamar('POST', '/api/reservas', {}, tAna);
  igual(r.estado, 400, 'estado');
  const e = r.datos.errores;
  verdadero(e.fecha && e.horaInicio && e.horaFin && e.motivo && e.ambienteId, 'faltan errores obligatorios');
});
await probar('RN-03', 'Hora de fin menor o igual a la de inicio devuelve 400', async () => {
  const r1 = await crearReserva(nuevaFecha(), '10:00', '09:00');
  const r2 = await crearReserva(nuevaFecha(), '10:00', '10:00');
  igual(r1.estado, 400, 'fin menor');
  igual(r2.estado, 400, 'fin igual');
  verdadero(r1.datos.errores.horaFin, 'falta el error de hora de fin');
});
await probar('RN-04', 'Reservas fuera del horario 07:00 a 22:00 devuelven 400', async () => {
  igual((await crearReserva(nuevaFecha(), '06:00', '08:00')).estado, 400, 'antes de las 07:00');
  igual((await crearReserva(nuevaFecha(), '21:00', '23:00')).estado, 400, 'después de las 22:00');
});
await probar('RN-04', 'Los límites del horario (07:00 a 22:00) sí se permiten', async () => {
  igual((await crearReserva(nuevaFecha(), '07:00', '22:00')).estado, 201, 'estado');
});
await probar('RV', 'No se permiten fechas pasadas ni formatos de fecha inválidos', async () => {
  igual((await crearReserva('2020-01-01', '08:00', '09:00')).estado, 400, 'fecha pasada');
  igual((await crearReserva('10/11/2030', '08:00', '09:00')).estado, 400, 'formato');
});
await probar('RV', 'Un ambiente en mantenimiento no se puede reservar (422)', async () => {
  igual((await crearReserva(nuevaFecha(), '08:00', '09:00', { ambienteId: mantenimiento.id })).estado, 422, 'estado');
});

// ---------- RF-04 y RN-01 disponibilidad ----------
await probar('RF-04 / RN-01', 'No se registra una reserva que se cruza con una aprobada (409)', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '08:00', '10:00');
  igual((await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin)).estado, 200, 'aprobación');
  igual((await crearReserva(fecha, '09:00', '11:00', {}, tLuis)).estado, 409, 'cruce parcial');
  igual((await crearReserva(fecha, '08:00', '10:00', {}, tLuis)).estado, 409, 'mismo horario');
});
await probar('RF-04', 'Horarios contiguos (fin = inicio) NO se consideran cruzados', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '08:00', '10:00');
  await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin);
  igual((await crearReserva(fecha, '10:00', '12:00', {}, tLuis)).estado, 201, 'estado');
});
await probar('RF-04', 'El mismo horario en otro ambiente sí está disponible', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '08:00', '10:00');
  await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin);
  igual((await crearReserva(fecha, '08:00', '10:00', { ambienteId: otroLab.id })).estado, 201, 'estado');
});
await probar('RF-04', 'Los endpoints de disponibilidad y ocupación informan libre/ocupado y las franjas', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '14:00', '16:00');
  await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin);
  const ocupado = await llamar('GET', `/api/reservas/disponibilidad?ambienteId=${lab.id}&fecha=${fecha}&horaInicio=15:00&horaFin=17:00`, null, tAna);
  const libre = await llamar('GET', `/api/reservas/disponibilidad?ambienteId=${lab.id}&fecha=${fecha}&horaInicio=16:00&horaFin=17:00`, null, tAna);
  igual(ocupado.datos.disponible, false, 'ocupado');
  igual(libre.datos.disponible, true, 'libre');
  const franjas = await llamar('GET', `/api/reservas/ocupacion?ambienteId=${lab.id}&fecha=${fecha}`, null, tAna);
  igual(franjas.datos.length, 1, 'cantidad de franjas');
  igual(franjas.datos[0].horaInicio, '14:00', 'inicio de la franja');
});
await probar('RN-01', 'Al aprobar no se permite una segunda reserva aprobada en el mismo horario (409)', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '08:00', '10:00');
  const b = await crearReserva(fecha, '09:00', '11:00', {}, tLuis); // ambas pendientes
  igual(b.estado, 201, 'la segunda pendiente sí se registra');
  igual((await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin)).estado, 200, 'aprobar la primera');
  igual((await llamar('PATCH', `/api/reservas/${b.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin)).estado, 409, 'aprobar la segunda');
});

// ---------- RN-05 y RN-06 ----------
await probar('RN-05', 'Solo el administrador puede aprobar o rechazar (403 para los demás)', async () => {
  const a = await crearReserva(nuevaFecha(), '08:00', '10:00');
  const ruta = `/api/reservas/${a.datos.id}/estado`;
  igual((await llamar('PATCH', ruta, { estado: 'Aprobada' }, tAna)).estado, 403, 'solicitante aprueba');
  igual((await llamar('PATCH', ruta, { estado: 'Rechazada' }, tResp)).estado, 403, 'responsable rechaza');
  igual((await llamar('PATCH', ruta, { estado: 'Aprobada' })).estado, 401, 'sin sesión');
  igual((await llamar('PATCH', ruta, { estado: 'Aprobada' }, tAdmin)).estado, 200, 'administrador aprueba');
});
await probar('RN-06', 'Una reserva rechazada no puede modificarse ni cambiar de estado (422)', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '08:00', '10:00');
  igual((await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Rechazada' }, tAdmin)).estado, 200, 'rechazar');
  igual((await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Aprobada' }, tAdmin)).estado, 422, 'aprobar una rechazada');
  const editar = await llamar('PUT', `/api/reservas/${a.datos.id}`, { fecha, horaInicio: '09:00', horaFin: '11:00', motivo: 'Cambio', ambienteId: lab.id }, tAna);
  igual(editar.estado, 422, 'editar una rechazada');
});

// ---------- RF-05, RF-06 y alcance por rol ----------
await probar('RF-05', 'Listar reservas devuelve datos y permite filtrar por estado y por texto', async () => {
  const todas = await llamar('GET', '/api/reservas', null, tAdmin);
  igual(todas.estado, 200, 'estado');
  verdadero(todas.datos.length > 0, 'la lista está vacía');
  const pendientes = await llamar('GET', '/api/reservas?estado=Pendiente', null, tAdmin);
  verdadero(pendientes.datos.every((r) => r.estado === 'Pendiente'), 'el filtro de estado no se aplicó');
  const texto = await llamar('GET', '/api/reservas?texto=Auditorio', null, tAdmin);
  verdadero(texto.datos.length > 0 && texto.datos.every((r) => r.ambienteNombre.includes('Auditorio')), 'la búsqueda por texto no se aplicó');
  igual((await llamar('GET', '/api/reservas?estado=Inventado', null, tAdmin)).estado, 400, 'estado inválido');
});
await probar('RF-05 / ROL', 'Cada rol ve solo lo que le corresponde (solicitante, responsable y administrador)', async () => {
  const admin = (await llamar('GET', '/api/reservas', null, tAdmin)).datos;
  const ana = (await llamar('GET', '/api/reservas', null, tAna)).datos;
  const resp = (await llamar('GET', '/api/reservas', null, tResp)).datos;
  verdadero(ana.length > 0 && ana.every((r) => r.usuarioId === sAna.usuario.id), 'el solicitante ve reservas ajenas');
  verdadero(admin.length > ana.length, 'el administrador debería ver más reservas');
  const idsResponsable = ambientes.filter((a) => a.responsableId === sResp.usuario.id).map((a) => a.id);
  verdadero(resp.every((r) => idsResponsable.includes(r.ambienteId) || r.usuarioId === sResp.usuario.id), 'el responsable ve reservas de otros ambientes');
  verdadero(!resp.some((r) => r.ambienteId === sala.id && r.usuarioId !== sResp.usuario.id), 'el responsable ve la sala que no tiene asignada');
});
await probar('RF-06', 'Detalle de una reserva: propio (200), ajeno (403) e inexistente (404)', async () => {
  const propia = (await llamar('GET', '/api/reservas', null, tAna)).datos[0];
  igual((await llamar('GET', `/api/reservas/${propia.id}`, null, tAna)).estado, 200, 'propia');
  igual((await llamar('GET', `/api/reservas/${propia.id}`, null, tLuis)).estado, 403, 'ajena');
  igual((await llamar('GET', `/api/reservas/${propia.id}`, null, tAdmin)).estado, 200, 'administrador');
  igual((await llamar('GET', '/api/reservas/00000000-0000-0000-0000-000000000000', null, tAdmin)).estado, 404, 'inexistente');
});

// ---------- RF-07 ----------
await probar('RF-07', 'Flujo de estados: Pendiente → Aprobada → Cancelada; Cancelada es final', async () => {
  const a = await crearReserva(nuevaFecha(), '08:00', '10:00');
  const ruta = `/api/reservas/${a.datos.id}/estado`;
  igual((await llamar('PATCH', ruta, { estado: 'Aprobada' }, tAdmin)).datos.estado, 'Aprobada', 'aprobada');
  igual((await llamar('PATCH', ruta, { estado: 'Rechazada' }, tAdmin)).estado, 422, 'aprobada no pasa a rechazada');
  igual((await llamar('PATCH', ruta, { estado: 'Cancelada' }, tAna)).datos.estado, 'Cancelada', 'cancelada por el solicitante');
  igual((await llamar('PATCH', ruta, { estado: 'Aprobada' }, tAdmin)).estado, 422, 'cancelada es final');
});
await probar('RF-07', 'Un solicitante solo puede cancelar sus propias reservas (403)', async () => {
  const a = await crearReserva(nuevaFecha(), '08:00', '10:00');
  igual((await llamar('PATCH', `/api/reservas/${a.datos.id}/estado`, { estado: 'Cancelada' }, tLuis)).estado, 403, 'estado');
});
await probar('RF-07', 'Modificar una reserva pendiente funciona y valida las reglas (PUT)', async () => {
  const fecha = nuevaFecha();
  const a = await crearReserva(fecha, '08:00', '10:00');
  const ok = await llamar('PUT', `/api/reservas/${a.datos.id}`, { fecha, horaInicio: '09:00', horaFin: '11:00', motivo: 'Motivo actualizado', ambienteId: lab.id }, tAna);
  igual(ok.estado, 200, 'modificar');
  igual(ok.datos.horaInicio, '09:00', 'hora actualizada');
  const mal = await llamar('PUT', `/api/reservas/${a.datos.id}`, { fecha, horaInicio: '12:00', horaFin: '11:00', motivo: 'x', ambienteId: lab.id }, tAna);
  igual(mal.estado, 400, 'modificar con horas inválidas');
});

// ---------- RF-08 dashboard ----------
await probar('RF-08', 'El dashboard coincide con el listado de reservas visible para cada rol', async () => {
  for (const [token, nombre] of [[tAdmin, 'administrador'], [tAna, 'solicitante'], [tResp, 'responsable']]) {
    const lista = (await llamar('GET', '/api/reservas', null, token)).datos;
    const d = (await llamar('GET', '/api/dashboard', null, token)).datos;
    igual(d.totalReservas, lista.length, `total (${nombre})`);
    igual(d.pendientes, lista.filter((r) => r.estado === 'Pendiente').length, `pendientes (${nombre})`);
    igual(d.aprobadas, lista.filter((r) => r.estado === 'Aprobada').length, `aprobadas (${nombre})`);
    igual(d.rechazadas, lista.filter((r) => r.estado === 'Rechazada').length, `rechazadas (${nombre})`);
    verdadero(d.alcance && d.alcance.length > 0, `alcance (${nombre})`);
    const conteo = {};
    lista.forEach((r) => { conteo[r.ambienteNombre] = (conteo[r.ambienteNombre] || 0) + 1; });
    igual(d.reservasAmbienteMasUtilizado, lista.length ? Math.max(...Object.values(conteo)) : 0, `ambiente más utilizado (${nombre})`);
  }
});

console.log(`\nResultado: ${aprobadas} aprobadas, ${fallidas} fallidas`);
process.exit(fallidas === 0 ? 0 : 1);
