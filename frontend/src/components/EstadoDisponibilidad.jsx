import { CircleCheck, CircleX, Clock } from 'lucide-react'

// Indica el resultado de la verificación de disponibilidad (RF-04).
// estado: neutro | verificando | libre | ocupado
function EstadoDisponibilidad({ estado, mensaje }) {
  if (estado === 'neutro') {
    return (
      <p className="disponibilidad disponibilidad--neutro" role="status">
        <Clock size={18} aria-hidden="true" />
        <span>Elija ambiente, fecha y horario para comprobar la disponibilidad automáticamente.</span>
      </p>
    )
  }
  if (estado === 'verificando') {
    return (
      <p className="disponibilidad disponibilidad--verificando" role="status">
        <span className="boton__spinner boton__spinner--oscuro" aria-hidden="true" />
        <span>Verificando disponibilidad...</span>
      </p>
    )
  }
  const Icono = estado === 'libre' ? CircleCheck : CircleX
  return (
    <p className={'disponibilidad disponibilidad--' + estado} role={estado === 'ocupado' ? 'alert' : 'status'}>
      <Icono size={20} aria-hidden="true" />
      <span>{mensaje}</span>
    </p>
  )
}

export default EstadoDisponibilidad
