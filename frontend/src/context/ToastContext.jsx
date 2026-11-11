import { createContext, useCallback, useContext, useState } from 'react'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'

// Avisos breves que aparecen en una esquina y desaparecen solos (retroalimentación inmediata).
const ToastContext = createContext(null)

const ICONOS = { exito: CircleCheck, error: CircleX, info: Info, advertencia: TriangleAlert }

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const cerrar = useCallback((id) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id))
  }, [])

  const mostrar = useCallback(
    (tipo, texto) => {
      const id = Date.now() + Math.random()
      setAvisos((actuales) => [...actuales, { id, tipo, texto }])
      setTimeout(() => cerrar(id), 6000)
    },
    [cerrar],
  )

  return (
    <ToastContext.Provider value={{ mostrar }}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {avisos.map((aviso) => {
          const Icono = ICONOS[aviso.tipo] || Info
          return (
            <div key={aviso.id} className={'toast toast--' + aviso.tipo} role="status">
              <Icono size={20} aria-hidden="true" />
              <span className="toast__texto">{aviso.texto}</span>
              <button type="button" className="toast__cerrar" onClick={() => cerrar(aviso.id)} aria-label="Cerrar aviso">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
