// Cliente HTTP común: todos los servicios usan estas funciones para hablar con el backend.

const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5100'
const CLAVE_SESION = 'reservaupla.sesion'

let alExpirarSesion = null

// ---------- Manejo de la sesión guardada en el navegador ----------

// "recordar" = true guarda la sesión aunque se cierre el navegador.
export function guardarSesion(token, recordar) {
  borrarSesion()
  const almacen = recordar ? localStorage : sessionStorage
  almacen.setItem(CLAVE_SESION, token)
}

export function obtenerTokenGuardado() {
  return localStorage.getItem(CLAVE_SESION) || sessionStorage.getItem(CLAVE_SESION) || ''
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION)
  sessionStorage.removeItem(CLAVE_SESION)
}

// La aplicación indica qué hacer cuando el servidor responde que la sesión ya no es válida.
export function registrarAlExpirarSesion(funcion) {
  alExpirarSesion = funcion
}

// ---------- Errores y peticiones ----------

// Error con la información que devuelve el backend (código, mensaje y errores por campo).
export class ErrorApi extends Error {
  constructor(mensaje, estado, errores) {
    super(mensaje)
    this.estado = estado
    this.errores = errores || {}
  }
}

export async function solicitar(metodo, ruta, cuerpo, esInicioSesion = false) {
  const encabezados = { 'Content-Type': 'application/json' }
  const token = obtenerTokenGuardado()
  if (token) {
    encabezados['Authorization'] = 'Bearer ' + token
  }

  let respuesta
  try {
    respuesta = await fetch(URL_BASE + ruta, {
      method: metodo,
      headers: encabezados,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Verifique su conexión y que el sistema esté en funcionamiento.', 0, {})
  }

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    // Sesión vencida (no aplica al formulario de inicio de sesión).
    if (respuesta.status === 401 && !esInicioSesion && alExpirarSesion) {
      alExpirarSesion()
    }

    let mensaje = 'Ocurrió un error inesperado. Intente nuevamente.'
    if (datos && datos.mensaje) {
      mensaje = datos.mensaje
    } else if (respuesta.status === 400) {
      mensaje = 'Los datos enviados no son válidos.'
    }
    throw new ErrorApi(mensaje, respuesta.status, datos ? datos.errores : {})
  }

  return datos
}

// Convierte un objeto { clave: valor } en "?clave=valor", ignorando los valores vacíos.
export function crearQuery(parametros) {
  const consulta = new URLSearchParams()
  Object.keys(parametros).forEach((clave) => {
    const valor = parametros[clave]
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) {
      consulta.append(clave, valor)
    }
  })
  const texto = consulta.toString()
  return texto ? '?' + texto : ''
}
