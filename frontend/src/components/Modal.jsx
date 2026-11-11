import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const SELECTOR_FOCO = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Ventana modal base. Accesible:
//  - Se cierra con la tecla Esc, con el botón de cerrar o al pulsar el fondo.
//  - El foco queda dentro de la ventana y vuelve al elemento anterior al cerrarla.
function Modal({ abierto, titulo, onCerrar, children, acciones, ancho = false }) {
  const contenedor = useRef(null)

  useEffect(() => {
    if (!abierto) {
      return undefined
    }

    const elementoAnterior = document.activeElement
    document.body.style.overflow = 'hidden'

    // El foco entra a la ventana (al primer control o a la propia ventana).
    const controles = contenedor.current ? contenedor.current.querySelectorAll(SELECTOR_FOCO) : []
    if (controles.length > 0) {
      controles[0].focus()
    } else if (contenedor.current) {
      contenedor.current.focus()
    }

    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') {
        onCerrar()
        return
      }
      // Mantiene el foco dentro de la ventana al usar Tab.
      if (evento.key === 'Tab' && contenedor.current) {
        const lista = contenedor.current.querySelectorAll(SELECTOR_FOCO)
        if (lista.length === 0) return
        const primero = lista[0]
        const ultimo = lista[lista.length - 1]
        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault()
          ultimo.focus()
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault()
          primero.focus()
        }
      }
    }

    document.addEventListener('keydown', alPresionarTecla)
    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      document.body.style.overflow = ''
      if (elementoAnterior && elementoAnterior.focus) {
        elementoAnterior.focus()
      }
    }
  }, [abierto, onCerrar])

  if (!abierto) {
    return null
  }

  return (
    <div className="modal__fondo" onClick={onCerrar}>
      <div
        ref={contenedor}
        className={'modal' + (ancho ? ' modal--ancho' : '')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="modal__encabezado">
          <h2 id="modal-titulo" className="modal__titulo">{titulo}</h2>
          <button type="button" className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar ventana">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal__cuerpo">{children}</div>
        {acciones && <div className="modal__acciones">{acciones}</div>}
      </div>
    </div>
  )
}

export default Modal
