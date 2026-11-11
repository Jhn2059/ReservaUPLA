import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from '../layout/AppLayout.jsx'
import RutaProtegida from './RutaProtegida.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RecuperarAccesoPage from '../pages/RecuperarAccesoPage.jsx'
import InicioPage from '../pages/InicioPage.jsx'
import ReservasPage from '../pages/ReservasPage.jsx'
import NuevaReservaPage from '../pages/NuevaReservaPage.jsx'
import EditarReservaPage from '../pages/EditarReservaPage.jsx'
import AmbientesPage from '../pages/AmbientesPage.jsx'
import UsuariosPage from '../pages/UsuariosPage.jsx'
import AyudaPage from '../pages/AyudaPage.jsx'
import NoEncontradaPage from '../pages/NoEncontradaPage.jsx'

// Las pantallas públicas (login) no se muestran a quien ya inició sesión.
function SoloPublico({ children }) {
  const { usuario, cargando } = useAuth()
  if (!cargando && usuario) {
    return <Navigate to="/inicio" replace />
  }
  return children
}

// Todas las rutas de la aplicación en un solo lugar.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<SoloPublico><LoginPage /></SoloPublico>} />
      <Route path="/recuperar-acceso" element={<SoloPublico><RecuperarAccesoPage /></SoloPublico>} />

      <Route element={<RutaProtegida><AppLayout /></RutaProtegida>}>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/reservas/nueva" element={<NuevaReservaPage />} />
        <Route path="/reservas/:id/editar" element={<EditarReservaPage />} />
        <Route path="/ambientes" element={<AmbientesPage />} />
        <Route path="/usuarios" element={<RutaProtegida roles={['Administrador']}><UsuariosPage /></RutaProtegida>} />
        <Route path="/ayuda" element={<AyudaPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
