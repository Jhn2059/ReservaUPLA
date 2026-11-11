import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import ReservaForm from '../components/ReservaForm.jsx'

// RF-03: registrar una solicitud de reserva.
function NuevaReservaPage() {
  const [parametros] = useSearchParams()

  return (
    <section>
      <PageHeader
        titulo="Reservar un ambiente"
        descripcion="Complete los tres pasos. Comprobamos la disponibilidad por usted mientras escribe."
        migas={[{ texto: 'Inicio', to: '/inicio' }, { texto: 'Reservas', to: '/reservas' }, { texto: 'Nueva reserva' }]}
      />
      <ReservaForm reserva={null} ambientePrecargado={parametros.get('ambiente') || ''} />
    </section>
  )
}

export default NuevaReservaPage
