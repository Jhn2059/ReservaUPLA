import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import AccesoDenegadoPage from '../pages/AccesoDenegadoPage.jsx'

// Solo permite ver las pantallas a quienes iniciaron sesión (y, si se indica, tienen el rol adecuado).
function RutaProtegida({ children, roles }) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <div className="pantalla-carga" role="status">
        <Logo variante="completo" altura={96} />
        <p>Cargando ReservaUPLA...</p>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname + ubicacion.search }} replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <AccesoDenegadoPage />
  }

  return children
}

export default RutaProtegida
