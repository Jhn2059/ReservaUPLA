import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarDays, CalendarPlus, CircleCheck, CircleHelp, CircleX, ClipboardList, Hourglass, Inbox } from 'lucide-react'
import AlertMessage from '../components/AlertMessage.jsx'
import BadgeEstado from '../components/BadgeEstado.jsx'
import Button from '../components/Button.jsx'
import CardIndicador from '../components/CardIndicador.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Skeleton from '../components/Skeleton.jsx'
import TableList from '../components/TableList.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { obtenerIndicadores } from '../services/dashboardService.js'
import { listarReservas } from '../services/reservaService.js'
import { formatearFecha, obtenerSaludo } from '../utils/formatos.js'
import { obtenerFechaHoy } from '../validations/reglas.js'

// RF-08: indicadores básicos de reservas (según el rol del usuario).
function InicioPage() {
  const { usuario, esAdministrador } = useAuth()
  const [indicadores, setIndicadores] = useState(null)
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    setCargando(true)
    setError('')
    try {
      setIndicadores(await obtenerIndicadores())
      setReservas(await listarReservas({}))
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const hoy = obtenerFechaHoy()
  const proximas = reservas
    .filter((r) => r.fecha >= hoy && (r.estado === 'Pendiente' || r.estado === 'Aprobada'))
    .slice(0, 6)
  const porRevisar = reservas.filter((r) => r.estado === 'Pendiente' && r.fecha >= hoy).slice(0, 4)

  const columnas = [
    { clave: 'fecha', titulo: 'Fecha', render: (fila) => formatearFecha(fila.fecha) },
    { clave: 'horario', titulo: 'Horario', render: (fila) => fila.horaInicio + ' - ' + fila.horaFin },
    { clave: 'ambienteNombre', titulo: 'Ambiente' },
    { clave: 'solicitanteNombre', titulo: 'Solicitante' },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <BadgeEstado estado={fila.estado} /> },
  ]

  function porcentaje(cantidad) {
    if (!indicadores || indicadores.totalReservas === 0) return 0
    return Math.round((cantidad / indicadores.totalReservas) * 100)
  }

  const distribucion = indicadores
    ? [
        { nombre: 'Pendientes', cantidad: indicadores.pendientes, clase: 'pendiente' },
        { nombre: 'Aprobadas', cantidad: indicadores.aprobadas, clase: 'aprobada' },
        { nombre: 'Rechazadas', cantidad: indicadores.rechazadas, clase: 'rechazada' },
        { nombre: 'Canceladas', cantidad: indicadores.canceladas, clase: 'cancelada' },
      ]
    : []

  return (
    <section>
      <PageHeader
        titulo={obtenerSaludo() + ', ' + usuario.nombreCompleto.split(' ')[0]}
        descripcion={indicadores ? 'Resumen de: ' + indicadores.alcance.toLowerCase() + '.' : 'Resumen de sus reservas.'}
      >
        <Button texto="Reservar un ambiente" to="/reservas/nueva" variante="acento" icono={CalendarPlus} />
      </PageHeader>

      {error && (
        <AlertMessage tipo="error" titulo="No se pudo cargar la información" mensaje={error}>
          <button type="button" className="alerta__reintentar" onClick={cargar}>Reintentar</button>
        </AlertMessage>
      )}

      {cargando && !error && (
        <div className="panel">
          <Skeleton lineas={5} alto={22} />
        </div>
      )}

      {indicadores && (
        <>
          <div className="indicadores">
            <CardIndicador titulo="Total de reservas" valor={indicadores.totalReservas} descripcion="Reservas registradas" variante="azul" icono={ClipboardList} to="/reservas" />
            <CardIndicador titulo="Pendientes" valor={indicadores.pendientes} descripcion="En espera de aprobación" variante="amarillo" icono={Hourglass} to="/reservas?estado=Pendiente" />
            <CardIndicador titulo="Aprobadas" valor={indicadores.aprobadas} descripcion="Confirmadas" variante="verde" icono={CircleCheck} to="/reservas?estado=Aprobada" />
            <CardIndicador titulo="Rechazadas" valor={indicadores.rechazadas} descripcion="No autorizadas" variante="rojo" icono={CircleX} to="/reservas?estado=Rechazada" />
            <CardIndicador titulo="Ambiente más utilizado" valor={indicadores.ambienteMasUtilizado} descripcion={indicadores.reservasAmbienteMasUtilizado + ' reservas'} variante="gris" icono={Building2} to="/ambientes" />
          </div>

          <div className="rejilla-2">
            <div className="panel">
              <h2 className="panel__titulo">Distribución por estado</h2>
              <ul className="barras">
                {distribucion.map((item) => (
                  <li key={item.nombre} className="barras__fila">
                    <span className="barras__nombre">{item.nombre}</span>
                    <span className="barras__pista" role="img" aria-label={item.cantidad + ' reservas, ' + porcentaje(item.cantidad) + ' por ciento'}>
                      <span className={'barras__relleno barras__relleno--' + item.clase} style={{ width: porcentaje(item.cantidad) + '%' }} />
                    </span>
                    <span className="barras__valor">{item.cantidad} <small>({porcentaje(item.cantidad)}%)</small></span>
                  </li>
                ))}
              </ul>
            </div>

            {esAdministrador ? (
              <div className="panel">
                <h2 className="panel__titulo">Requieren su decisión</h2>
                {porRevisar.length === 0 ? (
                  <EmptyState icono={Inbox} titulo="No hay solicitudes pendientes" descripcion="Cuando lleguen nuevas solicitudes aparecerán aquí." />
                ) : (
                  <ul className="pendientes">
                    {porRevisar.map((reserva) => (
                      <li key={reserva.id}>
                        <div>
                          <strong>{reserva.ambienteNombre}</strong>
                          <span>{formatearFecha(reserva.fecha)} · {reserva.horaInicio} - {reserva.horaFin} · {reserva.solicitanteNombre}</span>
                        </div>
                        <Link to="/reservas?estado=Pendiente" className="pendientes__enlace">Revisar</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="panel">
                <h2 className="panel__titulo">Atajos</h2>
                <ul className="atajos">
                  <li><Link to="/reservas/nueva"><CalendarPlus size={22} aria-hidden="true" /><span><strong>Reservar un ambiente</strong><small>Solicite un laboratorio, auditorio o sala</small></span></Link></li>
                  <li><Link to="/reservas"><CalendarDays size={22} aria-hidden="true" /><span><strong>Ver mis reservas</strong><small>Consulte el estado de sus solicitudes</small></span></Link></li>
                  <li><Link to="/ambientes"><Building2 size={22} aria-hidden="true" /><span><strong>Explorar ambientes</strong><small>Capacidad, ubicación y responsables</small></span></Link></li>
                  <li><Link to="/ayuda"><CircleHelp size={22} aria-hidden="true" /><span><strong>Centro de ayuda</strong><small>Cómo reservar y reglas del sistema</small></span></Link></li>
                </ul>
              </div>
            )}
          </div>

          <div className="panel">
            <h2 className="panel__titulo">Próximas reservas</h2>
            {proximas.length === 0 ? (
              <EmptyState icono={CalendarDays} titulo="No hay reservas próximas" descripcion="Las reservas pendientes o aprobadas de los próximos días aparecerán aquí.">
                <Button texto="Reservar un ambiente" to="/reservas/nueva" />
              </EmptyState>
            ) : (
              <>
                <TableList columnas={columnas} filas={proximas} caption="Próximas reservas" />
                <p className="panel__pie"><Link to="/reservas">Ver todas las reservas</Link></p>
              </>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default InicioPage
