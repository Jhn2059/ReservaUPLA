import { HORA_APERTURA, HORA_CIERRE, obtenerFechaHoy } from './reglas.js'

// Valida ambiente, fecha y horario. Se usa en el formulario y al consultar disponibilidad.
// Aplica RN-02 (datos obligatorios), RN-03 (fin > inicio) y RN-04 (07:00 a 22:00).
export function validarHorarioReserva(datos) {
  const errores = {}

  if (!datos.ambienteId) {
    errores.ambienteId = 'Seleccione el ambiente que necesita.'
  }

  if (!datos.fecha) {
    errores.fecha = 'Indique la fecha de la reserva.'
  } else if (datos.fecha < obtenerFechaHoy()) {
    errores.fecha = 'La fecha no puede ser anterior a hoy.'
  }

  if (!datos.horaInicio) {
    errores.horaInicio = 'Indique la hora de inicio.'
  } else if (datos.horaInicio < HORA_APERTURA) {
    errores.horaInicio = 'La hora de inicio no puede ser antes de las 07:00.'
  }

  if (!datos.horaFin) {
    errores.horaFin = 'Indique la hora de fin.'
  } else if (datos.horaFin > HORA_CIERRE) {
    errores.horaFin = 'La hora de fin no puede ser después de las 22:00.'
  }

  // Las horas tienen formato hh:mm, por eso se pueden comparar como texto.
  if (datos.horaInicio && datos.horaFin && datos.horaFin <= datos.horaInicio) {
    errores.horaFin = 'La hora de fin debe ser mayor que la hora de inicio.'
  }

  return errores
}

// Valida todos los datos de una reserva (horario + motivo). El solicitante es el usuario con sesión.
export function validarReserva(datos) {
  const errores = validarHorarioReserva(datos)
  const motivo = (datos.motivo || '').trim()

  if (motivo === '') {
    errores.motivo = 'Cuente brevemente para qué necesita el ambiente.'
  } else if (motivo.length > 500) {
    errores.motivo = 'El motivo no puede superar los 500 caracteres.'
  }

  return errores
}
