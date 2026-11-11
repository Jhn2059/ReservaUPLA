import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'

const ICONOS = { exito: CircleCheck, error: CircleX, info: Info, advertencia: TriangleAlert }

// Mensaje de alerta reutilizable. Nunca depende solo del color: lleva ícono y texto.
// tipo: exito | error | info | advertencia
function AlertMessage({ tipo = 'info', titulo, mensaje, onCerrar, children }) {
  if (!mensaje && !children) {
    return null
  }

  const Icono = ICONOS[tipo] || Info
  // Los errores se anuncian de inmediato en los lectores de pantalla.
  const rol = tipo === 'error' ? 'alert' : 'status'

  return (
    <div className={'alerta alerta--' + tipo} role={rol}>
      <Icono className="alerta__icono" size={22} aria-hidden="true" />
      <div className="alerta__cuerpo">
        {titulo && <strong className="alerta__titulo">{titulo}</strong>}
        {mensaje && <span>{mensaje}</span>}
        {children}
      </div>
      {onCerrar && (
        <button type="button" className="alerta__cerrar" onClick={onCerrar} aria-label="Cerrar mensaje">
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default AlertMessage
