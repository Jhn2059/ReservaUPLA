import { EXPRESION_CORREO, ROLES } from './reglas.js'
import { validarContrasena } from './contrasenaValidations.js'

// Valida el formulario de usuarios. Devuelve { campo: mensaje }. Si está vacío, no hay errores.
export function validarUsuario(datos) {
  const errores = {}
  const nombre = (datos.nombreCompleto || '').trim()
  const correo = (datos.correo || '').trim()

  if (nombre === '') {
    errores.nombreCompleto = 'El nombre completo es obligatorio.'
  } else if (nombre.length > 150) {
    errores.nombreCompleto = 'El nombre completo no puede superar los 150 caracteres.'
  }

  if (correo === '') {
    errores.correo = 'El correo es obligatorio.'
  } else if (!EXPRESION_CORREO.test(correo)) {
    errores.correo = 'El correo no tiene un formato válido. Ejemplo: nombre.apellido@upla.edu.pe'
  } else if (correo.length > 150) {
    errores.correo = 'El correo no puede superar los 150 caracteres.'
  }

  if (!datos.rol) {
    errores.rol = 'Debe seleccionar un rol.'
  } else if (!ROLES.includes(datos.rol)) {
    errores.rol = 'El rol seleccionado no es válido.'
  }

  const errorContrasena = validarContrasena(datos.contrasena)
  if (errorContrasena) {
    errores.contrasena = errorContrasena
  }

  return errores
}
