// Funciones para mostrar fechas y horas en lenguaje natural.

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']

// "2026-11-06" -> "06/11/2026"
export function formatearFecha(texto) {
  if (!texto) return ''
  const partes = texto.split('-')
  return partes[2] + '/' + partes[1] + '/' + partes[0]
}

// "2026-11-06" -> "viernes 6 de noviembre de 2026"
export function formatearFechaLarga(texto) {
  if (!texto) return ''
  const [anio, mes, dia] = texto.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)
  return DIAS[fecha.getDay()] + ' ' + dia + ' de ' + MESES[mes - 1] + ' de ' + anio
}

// "08:00", "10:30" -> "2 h 30 min"
export function calcularDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return ''
  const [h1, m1] = horaInicio.split(':').map(Number)
  const [h2, m2] = horaFin.split(':').map(Number)
  const minutos = h2 * 60 + m2 - (h1 * 60 + m1)
  if (minutos <= 0) return ''
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return resto + ' min'
  if (resto === 0) return horas + ' h'
  return horas + ' h ' + resto + ' min'
}

// "08:00" + 2 horas -> "10:00"
export function sumarHoras(hora, horas) {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m + horas * 60
  const nuevaHora = Math.floor(total / 60)
  const nuevoMinuto = total % 60
  return String(nuevaHora).padStart(2, '0') + ':' + String(nuevoMinuto).padStart(2, '0')
}

// "Ana Torres Salas" -> "AT"
export function obtenerIniciales(nombre) {
  const palabras = (nombre || '').trim().split(/\s+/)
  const primera = palabras[0] ? palabras[0][0] : ''
  const segunda = palabras[1] ? palabras[1][0] : ''
  return (primera + segunda).toUpperCase()
}

// Saludo según la hora del día.
export function obtenerSaludo() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
