import { EXPRESION_CORREO } from './reglas.js'

// Valida un solo campo del inicio de sesión (se usa al salir del campo y al enviar).
export function validarCampoLogin(nombre, valor) {
  if (nombre === 'correo') {
    const correo = (valor || '').trim()
    if (correo === '') return 'Escriba su correo institucional.'
    if (!EXPRESION_CORREO.test(correo)) return 'El correo no tiene un formato válido. Ejemplo: nombre.apellido@upla.edu.pe'
  }
  if (nombre === 'contrasena') {
    if (!valor) return 'Escriba su contraseña.'
  }
  return ''
}

// Valida todo el formulario. Devuelve { campo: mensaje }.
export function validarLogin(datos) {
  const errores = {}
  const errorCorreo = validarCampoLogin('correo', datos.correo)
  const errorContrasena = validarCampoLogin('contrasena', datos.contrasena)
  if (errorCorreo) errores.correo = errorCorreo
  if (errorContrasena) errores.contrasena = errorContrasena
  return errores
}
