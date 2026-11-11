// Pruebas de las validaciones y utilidades del frontend (sin navegador).
// Uso:  node tests/validations.test.mjs
import { validarUsuario } from '../src/validations/usuarioValidations.js'
import { validarAmbiente } from '../src/validations/ambienteValidations.js'
import { validarReserva, validarHorarioReserva } from '../src/validations/reservaValidations.js'
import { validarLogin, validarCampoLogin } from '../src/validations/loginValidations.js'
import { evaluarContrasena, validarContrasena } from '../src/validations/contrasenaValidations.js'
import { obtenerFechaHoy } from '../src/validations/reglas.js'
import { calcularDuracion, formatearFecha, formatearFechaLarga, obtenerIniciales, sumarHoras } from '../src/utils/formatos.js'

let aprobadas = 0
let fallidas = 0

function probar(codigo, descripcion, condicion) {
  if (condicion) {
    aprobadas++
    console.log('APROBADO | ' + codigo + ' | ' + descripcion)
  } else {
    fallidas++
    console.log('FALLIDO  | ' + codigo + ' | ' + descripcion)
  }
}
const tiene = (errores, ...campos) => campos.every((c) => Boolean(errores[c]))
const vacio = (errores) => Object.keys(errores).length === 0

const hoy = obtenerFechaHoy()
const reservaValida = { ambienteId: 'a1', fecha: hoy, horaInicio: '08:00', horaFin: '10:00', motivo: 'Clase' }

// ---- Inicio de sesión ----
probar('LOGIN', 'Formulario vacío: errores en correo y contraseña', tiene(validarLogin({ correo: '', contrasena: '' }), 'correo', 'contrasena'))
probar('LOGIN', 'Correo sin formato válido es rechazado', tiene(validarLogin({ correo: 'ana@', contrasena: 'x' }), 'correo'))
probar('LOGIN', 'Datos correctos no generan errores', vacio(validarLogin({ correo: 'ana@upla.edu.pe', contrasena: 'x' })))
probar('LOGIN', 'Se valida un solo campo al salir de él (sin errores de otros campos)', validarCampoLogin('correo', 'ana@upla.edu.pe') === '' && validarCampoLogin('contrasena', '') !== '')

// ---- Contraseñas ----
probar('PWD', 'Contraseña débil es rechazada (sin mayúscula, sin número o muy corta)', ['abcdefgh', 'ABCDEFG1', 'Abc1', 'abcdefg1'].every((c) => validarContrasena(c) !== ''))
probar('PWD', 'Contraseña segura es aceptada', validarContrasena('Upla2026!') === '')
probar('PWD', 'El indicador de requisitos marca los cumplidos', evaluarContrasena('Abcdefg1').every((r) => r.cumple) && evaluarContrasena('abc').some((r) => !r.cumple))

// ---- Usuarios (RF-01) ----
probar('RF-01', 'Usuario vacío: errores en nombre, correo, rol y contraseña', tiene(validarUsuario({}), 'nombreCompleto', 'correo', 'rol', 'contrasena'))
probar('RF-01', 'Correo sin formato válido es rechazado', tiene(validarUsuario({ nombreCompleto: 'Ana', correo: 'ana@', rol: 'Solicitante', contrasena: 'Valida2026' }), 'correo'))
probar('RF-01', 'Usuario correcto no genera errores', vacio(validarUsuario({ nombreCompleto: 'Ana Torres', correo: 'ana@upla.edu.pe', rol: 'Solicitante', contrasena: 'Valida2026' })))
probar('RF-01', 'Rol inexistente es rechazado', tiene(validarUsuario({ nombreCompleto: 'Ana', correo: 'ana@upla.edu.pe', rol: 'Invitado', contrasena: 'Valida2026' }), 'rol'))

// ---- Ambientes (RF-02) ----
probar('RF-02', 'Ambiente vacío: errores en nombre, tipo, capacidad y ubicación', tiene(validarAmbiente({ capacidad: '' }), 'nombre', 'tipo', 'capacidad', 'ubicacion'))
probar('RF-02', 'Capacidad 0, negativa o decimal es rechazada', ['0', '-5', '2.5'].every((c) => tiene(validarAmbiente({ nombre: 'A', tipo: 'Auditorio', capacidad: c, ubicacion: 'X' }), 'capacidad')))
probar('RF-02', 'Ambiente correcto no genera errores', vacio(validarAmbiente({ nombre: 'Aula 1', tipo: 'Auditorio', capacidad: '40', ubicacion: 'Piso 1' })))

// ---- Reservas (RF-03, RN-02, RN-03, RN-04) ----
probar('RN-02', 'Reserva vacía: error en ambiente, fecha, horas y motivo', tiene(validarReserva({}), 'ambienteId', 'fecha', 'horaInicio', 'horaFin', 'motivo'))
probar('RN-03', 'Hora de fin igual o menor que la de inicio es rechazada', tiene(validarHorarioReserva({ ...reservaValida, horaFin: '08:00' }), 'horaFin') && tiene(validarHorarioReserva({ ...reservaValida, horaFin: '07:30' }), 'horaFin'))
probar('RN-04', 'Hora de inicio antes de las 07:00 es rechazada', tiene(validarHorarioReserva({ ...reservaValida, horaInicio: '06:00' }), 'horaInicio'))
probar('RN-04', 'Hora de fin después de las 22:00 es rechazada', tiene(validarHorarioReserva({ ...reservaValida, horaFin: '23:00' }), 'horaFin'))
probar('RN-04', 'Los límites 07:00 y 22:00 sí son válidos', vacio(validarHorarioReserva({ ...reservaValida, horaInicio: '07:00', horaFin: '22:00' })))
probar('RV', 'Una fecha pasada es rechazada', tiene(validarHorarioReserva({ ...reservaValida, fecha: '2020-01-01' }), 'fecha'))
probar('RF-03', 'Reserva correcta no genera errores', vacio(validarReserva(reservaValida)))
probar('RV', 'Motivo de más de 500 caracteres o solo espacios es rechazado', tiene(validarReserva({ ...reservaValida, motivo: 'x'.repeat(501) }), 'motivo') && tiene(validarReserva({ ...reservaValida, motivo: '   ' }), 'motivo'))

// ---- Utilidades de formato ----
probar('UX', 'La duración se calcula en lenguaje natural', calcularDuracion('08:00', '10:30') === '2 h 30 min' && calcularDuracion('08:00', '09:00') === '1 h' && calcularDuracion('10:00', '09:00') === '')
probar('UX', 'Los atajos de duración suman horas correctamente', sumarHoras('08:00', 2) === '10:00' && sumarHoras('13:30', 1) === '14:30')
probar('UX', 'Las fechas se muestran en formato legible', formatearFecha('2026-11-06') === '06/11/2026' && formatearFechaLarga('2026-11-06') === 'viernes 6 de noviembre de 2026')
probar('UX', 'Las iniciales del avatar salen del nombre', obtenerIniciales('Ana Torres Salas') === 'AT')

console.log('\nResultado: ' + aprobadas + ' aprobadas, ' + fallidas + ' fallidas')
process.exit(fallidas === 0 ? 0 : 1)
