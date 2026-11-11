import { Ban, CircleCheck, CircleX, Hourglass } from 'lucide-react'

const ICONOS = { Pendiente: Hourglass, Aprobada: CircleCheck, Rechazada: CircleX, Cancelada: Ban }

// Etiqueta del estado de la reserva: color + ícono + texto (no depende solo del color).
function BadgeEstado({ estado }) {
  const Icono = ICONOS[estado] || Hourglass
  return (
    <span className={'estado estado--' + estado.toLowerCase()}>
      <Icono size={14} aria-hidden="true" />
      {estado}
    </span>
  )
}

export default BadgeEstado
