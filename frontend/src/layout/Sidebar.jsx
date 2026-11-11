import { NavLink } from 'react-router-dom'
import { Building2, CalendarDays, CalendarPlus, CircleHelp, House, Users, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Arquitectura de la información: las opciones se agrupan por tarea del usuario
// y se muestran solo las que su rol necesita.
function obtenerGrupos(usuario) {
  const grupos = [
    { titulo: 'Principal', items: [{ texto: 'Inicio', to: '/inicio', icono: House }] },
    {
      titulo: 'Reservas',
      items: [
        { texto: usuario.rol === 'Solicitante' ? 'Mis reservas' : 'Reservas', to: '/reservas', icono: CalendarDays, exacto: true },
        { texto: 'Reservar un ambiente', to: '/reservas/nueva', icono: CalendarPlus },
      ],
    },
    { titulo: 'Catálogo', items: [{ texto: 'Ambientes', to: '/ambientes', icono: Building2 }] },
  ]
  if (usuario.rol === 'Administrador') {
    grupos.push({ titulo: 'Administración', items: [{ texto: 'Usuarios', to: '/usuarios', icono: Users }] })
  }
  grupos.push({ titulo: 'Soporte', items: [{ texto: 'Centro de ayuda', to: '/ayuda', icono: CircleHelp }] })
  return grupos
}

function Sidebar({ abierto, onCerrar }) {
  const { usuario } = useAuth()
  const grupos = obtenerGrupos(usuario)

  return (
    <>
      {abierto && <div className="sidebar__fondo" onClick={onCerrar} aria-hidden="true" />}
      <aside className={'sidebar' + (abierto ? ' sidebar--abierto' : '')} aria-label="Menú principal">
        <div className="sidebar__marca">
          <span className="sidebar__logo"><Logo variante="hex" altura={30} /></span>
          <div>
            <strong className="sidebar__nombre">ReservaUPLA</strong>
            <span className="sidebar__subtitulo">Universidad Peruana Los Andes</span>
          </div>
          <button type="button" className="sidebar__cerrar" onClick={onCerrar} aria-label="Cerrar menú">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="sidebar__grupo">
              <p className="sidebar__titulo-grupo">{grupo.titulo}</p>
              <ul className="sidebar__lista">
                {grupo.items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.exacto || item.to === '/inicio'} className="sidebar__enlace">
                      <item.icono size={20} aria-hidden="true" />
                      <span>{item.texto}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="sidebar__pie">Horario de reservas: 07:00 a 22:00</p>
      </aside>
    </>
  )
}

export default Sidebar
