import { solicitar, crearQuery } from './apiClient.js'

export function listarReservas(filtros) {
  return solicitar('GET', '/api/reservas' + crearQuery(filtros || {}))
}

export function obtenerReserva(id) {
  return solicitar('GET', '/api/reservas/' + id)
}

export function crearReserva(datos) {
  return solicitar('POST', '/api/reservas', datos)
}

export function actualizarReserva(id, datos) {
  return solicitar('PUT', '/api/reservas/' + id, datos)
}

export function cambiarEstadoReserva(id, estado) {
  return solicitar('PATCH', '/api/reservas/' + id + '/estado', { estado })
}

export function verificarDisponibilidad(ambienteId, fecha, horaInicio, horaFin) {
  return solicitar('GET', '/api/reservas/disponibilidad' + crearQuery({ ambienteId, fecha, horaInicio, horaFin }))
}

export function obtenerOcupacion(ambienteId, fecha) {
  return solicitar('GET', '/api/reservas/ocupacion' + crearQuery({ ambienteId, fecha }))
}
