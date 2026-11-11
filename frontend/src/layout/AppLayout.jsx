import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import UserMenu from './UserMenu.jsx'

// Estructura de todas las pantallas con sesión: menú lateral + barra superior + contenido.
function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const ubicacion = useLocation()

  // Al cambiar de página: se cierra el menú móvil y el foco pasa al título
  // (así los lectores de pantalla anuncian la nueva página).
  useEffect(() => {
    setMenuAbierto(false)
    const titulo = document.getElementById('titulo-pagina')
    if (titulo) {
      titulo.focus({ preventScroll: true })
    }
    window.scrollTo(0, 0)
  }, [ubicacion.pathname])

  return (
    <div className="app">
      <a className="saltar-contenido" href="#contenido">Saltar al contenido principal</a>
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="app__principal">
        <div className="topbar">
          <button type="button" className="topbar__menu" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú principal">
            <Menu size={24} aria-hidden="true" />
          </button>
          <p className="topbar__institucion">Sistema de reservas de ambientes universitarios</p>
          <UserMenu />
        </div>

        <main id="contenido" className="app__contenido">
          <Outlet />
        </main>

        <footer className="app__pie">ReservaUPLA · Universidad Peruana Los Andes · Huancayo, Perú</footer>
      </div>
    </div>
  )
}

export default AppLayout
