import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, CalendarPlus, Pencil, Search, SearchX } from 'lucide-react'
import AlertMessage from '../components/AlertMessage.jsx'
import BadgeEstado from '../components/BadgeEstado.jsx'
import Button from '../components/Button.jsx'
import Checkbox from '../components/Checkbox.jsx'
import ChipsFiltros from '../components/ChipsFiltros.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Modal from '../components/Modal.jsx'
import ModalConfirmacion from '../components/ModalConfirmacion.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Paginacion from '../components/Paginacion.jsx'
import SelectInput from '../components/SelectInput.jsx'
import Skeleton from '../components/Skeleton.jsx'
import TableList from '../components/TableList.jsx'
import TextInput from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { listarAmbientes } from '../services/ambienteService.js'
import { cambiarEstadoReserva, listarReservas } from '../services/reservaService.js'
import { calcularDuracion, formatearFecha, formatearFechaLarga } from '../utils/formatos.js'
import { ESTADOS_RESERVA } from '../validations/reglas.js'

const TAMANO_PAGINA = 8

// Textos que se muestran al confirmar cada acción.
const ACCIONES = {
  Aprobada: { titulo: 'Aprobar reserva', texto: '¿Desea aprobar esta reserva?', detalle: 'Quedará confirmada para el ambiente y horario indicados y bloqueará ese horario para otras solicitudes.', boton: 'Sí, aprobar', variante: 'exito' },
  Rechazada: { titulo: 'Rechazar reserva', texto: '¿Desea rechazar esta reserva?', detalle: 'Una reserva rechazada ya no podrá modificarse.', boton: 'Sí, rechazar', variante: 'peligro' },
  Cancelada: { titulo: 'Cancelar reserva', texto: '¿Desea cancelar esta reserva?', detalle: 'Esta acción no se puede deshacer. Si necesita el ambiente más adelante, deberá hacer una nueva solicitud.', boton: 'Sí, cancelar', variante: 'peligro' },
}

// RF-05, RF-06 y RF-07: listar reservas, ver su detalle y cambiar su estado.
function ReservasPage() {
  const { usuario, esAdministrador, esSolicitante } = useAuth()
  const { mostrar } = useToast()
  const navegar = useNavigate()
  const [parametros, setParametros] = useSearchParams()

  // Los filtros viven en la dirección (se pueden compartir y el botón "atrás" funciona).
  const estado = parametros.get('estado') || ''
  const ambienteId = parametros.get('ambienteId') || ''
  const textoAplicado = parametros.get('texto') || ''
  const soloMias = parametros.get('soloMias') === 'true'

  const [textoEscrito, setTextoEscrito] = useState(textoAplicado)
  const [pagina, setPagina] = useState(1)
  const [reservas, setReservas] = useState([])
  const [ambientes, setAmbientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [seleccionada, setSeleccionada] = useState(null)
  const [accionPendiente, setAccionPendiente] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    listarAmbientes().then(setAmbientes).catch(() => setAmbientes([]))
  }, [])

  function cambiarFiltro(clave, valor) {
    const copia = new URLSearchParams(parametros)
    if (valor) {
      copia.set(clave, valor)
    } else {
      copia.delete(clave)
    }
    setParametros(copia, { replace: true })
    setPagina(1)
  }

  // La búsqueda por texto se aplica poco después de dejar de escribir.
  useEffect(() => {
    if (textoEscrito === textoAplicado) return undefined
    const temporizador = setTimeout(() => cambiarFiltro('texto', textoEscrito.trim()), 450)
    return () => clearTimeout(temporizador)
  }, [textoEscrito])

  async function cargarReservas() {
    setCargando(true)
    setError('')
    try {
      setReservas(await listarReservas({ estado, ambienteId, texto: textoAplicado, soloMias }))
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarReservas()
  }, [estado, ambienteId, textoAplicado, soloMias])

  function limpiarFiltros() {
    setTextoEscrito('')
    setParametros({}, { replace: true })
    setPagina(1)
  }

  function quitarFiltro(clave) {
    if (clave === 'texto') setTextoEscrito('')
    cambiarFiltro(clave, '')
  }

  async function confirmarAccion() {
    setProcesando(true)
    try {
      const actualizada = await cambiarEstadoReserva(seleccionada.id, accionPendiente)
      mostrar('exito', 'La reserva quedó en estado ' + actualizada.estado + '.')
      setSeleccionada(null)
      setAccionPendiente('')
      await cargarReservas()
    } catch (fallo) {
      // Se muestra el motivo (por ejemplo, RN-01 o RN-05) dentro de la ventana de detalle.
      setErrorAccion(fallo.message)
      setAccionPendiente('')
    } finally {
      setProcesando(false)
    }
  }

  // Qué acciones puede hacer el usuario sobre la reserva seleccionada.
  const esDuenio = seleccionada ? seleccionada.usuarioId === usuario.id : false
  const estaPendiente = seleccionada ? seleccionada.estado === 'Pendiente' : false
  const estaAprobada = seleccionada ? seleccionada.estado === 'Aprobada' : false
  const puedeAprobarRechazar = esAdministrador && estaPendiente
  const puedeCancelar = (esAdministrador || esDuenio) && (estaPendiente || estaAprobada)
  const puedeEditar = (esAdministrador || esDuenio) && estaPendiente

  // Filtros activos (se muestran como etiquetas que se pueden quitar).
  const nombreAmbiente = (ambientes.find((a) => a.id === ambienteId) || {}).nombre
  const chips = []
  if (estado) chips.push({ clave: 'estado', texto: 'Estado: ' + estado })
  if (ambienteId) chips.push({ clave: 'ambienteId', texto: 'Ambiente: ' + (nombreAmbiente || '...') })
  if (textoAplicado) chips.push({ clave: 'texto', texto: 'Búsqueda: «' + textoAplicado + '»' })
  if (soloMias) chips.push({ clave: 'soloMias', texto: 'Solo mis reservas' })

  const totalPaginas = Math.max(1, Math.ceil(reservas.length / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = reservas.slice((paginaActual - 1) * TAMANO_PAGINA, paginaActual * TAMANO_PAGINA)

  const columnas = [
    { clave: 'fecha', titulo: 'Fecha', render: (fila) => formatearFecha(fila.fecha) },
    { clave: 'horario', titulo: 'Horario', render: (fila) => fila.horaInicio + ' - ' + fila.horaFin },
    { clave: 'ambienteNombre', titulo: 'Ambiente' },
    ...(esSolicitante ? [] : [{ clave: 'solicitanteNombre', titulo: 'Solicitante' }]),
    { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="celda-recortada" title={fila.motivo}>{fila.motivo}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <BadgeEstado estado={fila.estado} /> },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (fila) => (
        <Button texto="Ver detalle" variante="secundario" tamano="sm" onClick={(evento) => { evento.stopPropagation(); setErrorAccion(''); setSeleccionada(fila) }} />
      ),
    },
  ]

  const titulo = esSolicitante ? 'Mis reservas' : 'Reservas'
  const descripcion = esAdministrador
    ? 'Revise las solicitudes de toda la universidad y decida su aprobación.'
    : esSolicitante
      ? 'Consulte el estado de sus solicitudes y gestione sus reservas.'
      : 'Consulte las reservas de los ambientes que tiene asignados y las suyas.'

  return (
    <section>
      <PageHeader titulo={titulo} descripcion={descripcion} migas={[{ texto: 'Inicio', to: '/inicio' }, { texto: titulo }]}>
        <Button texto="Reservar un ambiente" to="/reservas/nueva" variante="acento" icono={CalendarPlus} />
      </PageHeader>

      <div className="panel filtros" role="search" aria-label="Filtrar reservas">
        <TextInput
          etiqueta="Buscar"
          nombre="texto"
          valor={textoEscrito}
          onChange={(e) => setTextoEscrito(e.target.value)}
          placeholder="Motivo, ambiente o solicitante"
          icono={Search}
        />
        <SelectInput etiqueta="Estado" nombre="estado" valor={estado} onChange={(e) => cambiarFiltro('estado', e.target.value)} opciones={ESTADOS_RESERVA.map((e) => ({ valor: e, texto: e }))} placeholder="Todos" />
        <SelectInput etiqueta="Ambiente" nombre="ambienteId" valor={ambienteId} onChange={(e) => cambiarFiltro('ambienteId', e.target.value)} opciones={ambientes.map((a) => ({ valor: a.id, texto: a.nombre }))} placeholder="Todos" />
        {!esSolicitante && (
          <div className="filtros__casilla">
            <Checkbox etiqueta="Solo mis reservas" nombre="soloMias" marcado={soloMias} onChange={(e) => cambiarFiltro('soloMias', e.target.checked ? 'true' : '')} />
          </div>
        )}
      </div>

      <ChipsFiltros filtros={chips} onQuitar={quitarFiltro} onLimpiar={limpiarFiltros} />

      {error && <AlertMessage tipo="error" titulo="No se pudo cargar el listado" mensaje={error}><button type="button" className="alerta__reintentar" onClick={cargarReservas}>Reintentar</button></AlertMessage>}

      <div className="panel">
        <p className="panel__resumen" aria-live="polite">
          {cargando ? 'Cargando reservas...' : reservas.length + (reservas.length === 1 ? ' reserva encontrada' : ' reservas encontradas')}
        </p>

        {cargando && <Skeleton lineas={6} alto={26} />}

        {!cargando && !error && reservas.length === 0 && (
          chips.length > 0 ? (
            <EmptyState icono={SearchX} titulo="No hay reservas con esos filtros" descripcion="Pruebe con otros criterios o quite los filtros aplicados.">
              <Button texto="Limpiar filtros" variante="secundario" onClick={limpiarFiltros} />
            </EmptyState>
          ) : (
            <EmptyState icono={CalendarDays} titulo="Aún no hay reservas" descripcion="Cuando registre una solicitud aparecerá en este listado.">
              <Button texto="Reservar un ambiente" to="/reservas/nueva" icono={CalendarPlus} />
            </EmptyState>
          )
        )}

        {!cargando && reservas.length > 0 && (
          <>
            <TableList columnas={columnas} filas={visibles} caption="Listado de reservas" onFilaClick={(fila) => { setErrorAccion(''); setSeleccionada(fila) }} />
            <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} total={reservas.length} tamano={TAMANO_PAGINA} onCambiar={setPagina} />
          </>
        )}
      </div>

      {/* RF-06: detalle de la reserva */}
      <Modal
        abierto={Boolean(seleccionada) && !accionPendiente}
        titulo="Detalle de la reserva"
        onCerrar={() => setSeleccionada(null)}
        acciones={
          seleccionada && (
            <>
              <Button texto="Cerrar" variante="terciario" onClick={() => setSeleccionada(null)} />
              {puedeEditar && <Button texto="Modificar" variante="secundario" icono={Pencil} onClick={() => navegar('/reservas/' + seleccionada.id + '/editar')} />}
              {puedeCancelar && <Button texto="Cancelar reserva" variante="peligro" onClick={() => setAccionPendiente('Cancelada')} />}
              {puedeAprobarRechazar && <Button texto="Rechazar" variante="peligro" onClick={() => setAccionPendiente('Rechazada')} />}
              {puedeAprobarRechazar && <Button texto="Aprobar" variante="exito" onClick={() => setAccionPendiente('Aprobada')} />}
            </>
          )
        }
      >
        {seleccionada && (
          <>
            <AlertMessage tipo="error" titulo="No se pudo completar la acción" mensaje={errorAccion} />
            <dl className="detalle">
              <dt>Ambiente</dt><dd>{seleccionada.ambienteNombre}</dd>
              <dt>Fecha</dt><dd>{formatearFechaLarga(seleccionada.fecha)}</dd>
              <dt>Horario</dt><dd>{seleccionada.horaInicio} a {seleccionada.horaFin} ({calcularDuracion(seleccionada.horaInicio, seleccionada.horaFin)})</dd>
              <dt>Solicitante</dt><dd>{seleccionada.solicitanteNombre}</dd>
              <dt>Motivo</dt><dd>{seleccionada.motivo}</dd>
              <dt>Estado</dt><dd><BadgeEstado estado={seleccionada.estado} /></dd>
              <dt>Registrada el</dt><dd>{new Date(seleccionada.fechaRegistro).toLocaleString('es-PE')}</dd>
            </dl>
            {seleccionada.estado === 'Rechazada' && <p className="detalle__nota">Una reserva rechazada no puede modificarse.</p>}
            {estaPendiente && !esAdministrador && <p className="detalle__nota">Esta solicitud espera la decisión de un administrador.</p>}
          </>
        )}
      </Modal>

      {/* Confirmación de la acción elegida */}
      <ModalConfirmacion
        abierto={Boolean(accionPendiente)}
        titulo={accionPendiente ? ACCIONES[accionPendiente].titulo : ''}
        mensaje={accionPendiente ? ACCIONES[accionPendiente].texto : ''}
        detalle={accionPendiente ? ACCIONES[accionPendiente].detalle : ''}
        textoConfirmar={accionPendiente ? ACCIONES[accionPendiente].boton : ''}
        variante={accionPendiente ? ACCIONES[accionPendiente].variante : 'primario'}
        cargando={procesando}
        onConfirmar={confirmarAccion}
        onCancelar={() => setAccionPendiente('')}
      />
    </section>
  )
}

export default ReservasPage
