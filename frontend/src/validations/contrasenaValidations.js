// Requisitos de una contraseña segura (los mismos que valida el backend).
export function evaluarContrasena(contrasena) {
  const texto = contrasena || ''
  return [
    { texto: 'Al menos 8 caracteres', cumple: texto.length >= 8 },
    { texto: 'Una letra mayúscula', cumple: /[A-ZÁÉÍÓÚÑ]/.test(texto) },
    { texto: 'Una letra minúscula', cumple: /[a-záéíóúñ]/.test(texto) },
    { texto: 'Un número', cumple: /[0-9]/.test(texto) },
  ]
}

export function validarContrasena(contrasena) {
  if (!contrasena) return 'La contraseña es obligatoria.'
  if (contrasena.length > 64) return 'La contraseña no puede superar los 64 caracteres.'
  const faltan = evaluarContrasena(contrasena).filter((requisito) => !requisito.cumple)
  if (faltan.length > 0) return 'La contraseña debe incluir una mayúscula, una minúscula, un número y al menos 8 caracteres.'
  return ''
}
