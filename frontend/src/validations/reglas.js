// Constantes compartidas por las validaciones del frontend.
// Deben coincidir con las reglas del backend.

export const HORA_APERTURA = '07:00'
export const HORA_CIERRE = '22:00'

export const EXPRESION_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const ROLES = ['Solicitante', 'Administrador', 'Responsable de ambiente']
export const TIPOS_AMBIENTE = ['Laboratorio de cómputo', 'Auditorio', 'Sala de reuniones', 'Laboratorio especializado']
export const ESTADOS_AMBIENTE = ['Disponible', 'Mantenimiento']
export const ESTADOS_RESERVA = ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada']

// Devuelve la fecha de hoy con formato aaaa-mm-dd (hora local).
export function obtenerFechaHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return hoy.getFullYear() + '-' + mes + '-' + dia
}
