import { ShieldAlert } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'

// Se muestra cuando el rol del usuario no permite entrar a una pantalla.
function AccesoDenegadoPage() {
  return (
    <section>
      <PageHeader titulo="Acceso restringido" />
      <EmptyState icono={ShieldAlert} titulo="Su rol no tiene acceso a esta sección" descripcion="Esta opción es solo para administradores. Si cree que es un error, comuníquese con el administrador del sistema.">
        <Button texto="Volver al inicio" to="/inicio" />
      </EmptyState>
    </section>
  )
}

export default AccesoDenegadoPage
