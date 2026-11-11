import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ReservaForm from '../components/ReservaForm.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { obtenerReserva } from '../services/reservaService.js'

// Modificar una reserva. RN-06: una reserva rechazada no puede modificarse.
function EditarReservaPage() {
  const { id } = useParams()
  const { esSolicitante } = useAuth()
  const { mostrar } = useToast()
  const navegar = useNavigate()
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerReserva(id)
      .then(setReserva)
      .catch((fallo) => setError(fallo.message))
  }, [id])

  function alGuardar() {
    mostrar('exito', 'La reserva se actualizó correctamente.')
    navegar('/reservas')
  }

  let contenido
  if (error) {
    contenido = <AlertMessage tipo="error" titulo="No se pudo abrir la reserva" mensaje={error} />
  } else if (!reserva) {
    contenido = <div className="panel"><Skeleton lineas={5} alto={24} /></div>
  } else if (reserva.estado === 'Rechazada') {
    contenido = <AlertMessage tipo="advertencia" titulo="No se puede modificar" mensaje="Una reserva rechazada no puede modificarse." />
  } else if (reserva.estado !== 'Pendiente') {
    contenido = <AlertMessage tipo="advertencia" titulo="No se puede modificar" mensaje="Solo se pueden modificar las reservas en estado Pendiente." />
  } else {
    contenido = <ReservaForm reserva={reserva} onGuardada={alGuardar} />
  }

  return (
    <section>
      <PageHeader
        titulo="Modificar reserva"
        descripcion="Cambie los datos de su solicitud mientras siga pendiente."
        migas={[{ texto: 'Inicio', to: '/inicio' }, { texto: esSolicitante ? 'Mis reservas' : 'Reservas', to: '/reservas' }, { texto: 'Modificar' }]}
      />
      {contenido}
      {(error || (reserva && reserva.estado !== 'Pendiente')) && <p className="panel__pie"><Button texto="Volver al listado" to="/reservas" variante="secundario" /></p>}
    </section>
  )
}

export default EditarReservaPage
