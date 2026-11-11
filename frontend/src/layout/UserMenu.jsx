import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { obtenerIniciales } from '../utils/formatos.js'

// Menú del usuario: muestra quién tiene la sesión iniciada y permite salir.
function UserMenu() {
  const { usuario, cerrarSesion } = useAuth()
  const { mostrar } = useToast()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)

  useEffect(() => {
    function cerrarSiClicFuera(evento) {
      if (contenedor.current && !contenedor.current.contains(evento.target)) {
        setAbierto(false)
      }
    }
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarSiClicFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarSiClicFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [])

  function salir() {
    cerrarSesion()
    mostrar('info', 'Cerró su sesión correctamente.')
  }

  return (
    <div className="usuario-menu" ref={contenedor}>
      <button type="button" className="usuario-menu__boton" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} aria-haspopup="true">
        <span className="usuario-menu__avatar" aria-hidden="true">{obtenerIniciales(usuario.nombreCompleto)}</span>
        <span className="usuario-menu__datos">
          <span className="usuario-menu__nombre">{usuario.nombreCompleto}</span>
          <span className="usuario-menu__rol">{usuario.rol}</span>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>

      {abierto && (
        <div className="usuario-menu__panel">
          <div className="usuario-menu__perfil">
            <strong>{usuario.nombreCompleto}</strong>
            <span>{usuario.correo}</span>
            <span className="usuario-menu__chip">{usuario.rol}</span>
          </div>
          <button type="button" className="usuario-menu__salir" onClick={salir}>
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
