import { TIPOS_AMBIENTE } from './reglas.js'

// Valida el formulario de ambientes (RF-02).
export function validarAmbiente(datos) {
  const errores = {}
  const nombre = (datos.nombre || '').trim()
  const ubicacion = (datos.ubicacion || '').trim()
  const capacidad = Number(datos.capacidad)

  if (nombre === '') {
    errores.nombre = 'El nombre del ambiente es obligatorio.'
  } else if (nombre.length > 100) {
    errores.nombre = 'El nombre no puede superar los 100 caracteres.'
  }

  if (!datos.tipo) {
    errores.tipo = 'Debe seleccionar el tipo de ambiente.'
  } else if (!TIPOS_AMBIENTE.includes(datos.tipo)) {
    errores.tipo = 'El tipo de ambiente no es válido.'
  }

  if (String(datos.capacidad).trim() === '') {
    errores.capacidad = 'La capacidad es obligatoria.'
  } else if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 1000) {
    errores.capacidad = 'La capacidad debe ser un número entero entre 1 y 1000.'
  }

  if (ubicacion === '') {
    errores.ubicacion = 'La ubicación es obligatoria.'
  } else if (ubicacion.length > 100) {
    errores.ubicacion = 'La ubicación no puede superar los 100 caracteres.'
  }

  return errores
}
