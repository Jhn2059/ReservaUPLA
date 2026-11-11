import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarClock, CircleCheck, Clock, MapPin, UserRound, Users } from 'lucide-react'
import AlertMessage from './AlertMessage.jsx'
import Button from './Button.jsx'
import DateInput from './DateInput.jsx'
import EstadoDisponibilidad from './EstadoDisponibilidad.jsx'
import LineaTiempoDia from './LineaTiempoDia.jsx'
import SelectInput from './SelectInput.jsx'
import TextInput from './TextInput.jsx'
import TimeInput from './TimeInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { listarAmbientes } from '../services/ambienteService.js'
import { actualizarReserva, crearReserva, obtenerOcupacion, verificarDisponibilidad } from '../services/reservaService.js'
import { validarHorarioReserva, validarReserva } from '../validations/reservaValidations.js'
import { HORA_APERTURA, HORA_CIERRE, obtenerFechaHoy } from '../validations/reglas.js'
import { actualizarCampo, enfocarPrimerError } from '../utils/formularios.js'
import { calcularDuracion, formatearFechaLarga, sumarHoras } from '../utils/formatos.js'

const ORDEN_CAMPOS = ['ambienteId', 'fecha', 'horaInicio', 'horaFin', 'motivo']
const MAXIMO_MOTIVO = 500

function fechaEnDias(dias) {
  const f = new Date()
  f.setDate(f.getDate() + dias)
  return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0')
}

// Formulario de reservas (RF-03). Sirve para registrar una reserva nueva y para modificar una pendiente.
// Diseño: preguntas agrupadas en 3 bloques (¿qué?, ¿cuándo?, ¿para qué?), línea de tiempo del día,
// verificación automática de disponibilidad y un resumen que se actualiza mientras se completa.
function ReservaForm({ reserva, ambientePrecargado, onGuardada }) {
  const { usuario } = useAuth()
  const modoEdicion = Boolean(reserva)

  const [ambientes, setAmbientes] = useState([])
  const [datos, setDatos] = useState({
    ambienteId: reserva ? reserva.ambienteId : ambientePrecargado || '',
    fecha: reserva ? reserva.fecha : '',
    horaInicio: reserva ? reserva.horaInicio : '',
    horaFin: reserva ? reserva.horaFin : '',
    motivo: reserva ? reserva.motivo : '',
  })
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [franjas, setFranjas] = useState([])
  const [disponibilidad, setDisponibilidad] = useState({ estado: 'neutro', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [creada, setCreada] = useState(null)

  useEffect(() => {
    listarAmbientes()
      .then(setAmbientes)
      .catch((error) => setMensaje({ tipo: 'error', texto: error.message }))
  }, [])

  const ambiente = ambientes.find((a) => a.id === datos.ambienteId)

  // Errores de un campo: los del envío o servidor, o los del propio campo si ya pasó por él.
  const erroresEnVivo = validarHorarioReserva(datos)
  function errorDe(campo) {
    if (errores[campo]) return errores[campo]
    if (tocados[campo] && erroresEnVivo[campo]) return erroresEnVivo[campo]
    return ''
  }
  function marcarTocado(evento) {
    setTocados({ ...tocados, [evento.target.name]: true })
  }

  function manejarCambio(evento) {
    actualizarCampo(evento, datos, setDatos, errores, setErrores)
    setMensaje(null)
  }

  function asignar(campo, valor) {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }))
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }))
    const copia = { ...errores }
    delete copia[campo]
    setErrores(copia)
  }

  // Al elegir ambiente y fecha, se consulta qué franjas ya están ocupadas (línea de tiempo).
  useEffect(() => {
    if (!datos.ambienteId || !datos.fecha || datos.fecha < obtenerFechaHoy()) {
      setFranjas([])
      return
    }
    let vigente = true
    obtenerOcupacion(datos.ambienteId, datos.fecha)
      .then((lista) => { if (vigente) setFranjas(lista) })
      .catch(() => { if (vigente) setFranjas([]) })
    return () => { vigente = false }
  }, [datos.ambienteId, datos.fecha])

  // Cuando los datos del horario están completos y válidos, se verifica la disponibilidad sola.
  useEffect(() => {
    const completos = datos.ambienteId && datos.fecha && datos.horaInicio && datos.horaFin
    if (!completos || Object.keys(validarHorarioReserva(datos)).length > 0) {
      setDisponibilidad({ estado: 'neutro', mensaje: '' })
      return undefined
    }
    let vigente = true
    setDisponibilidad({ estado: 'verificando', mensaje: '' })
    const temporizador = setTimeout(async () => {
      try {
        const resultado = await verificarDisponibilidad(datos.ambienteId, datos.fecha, datos.horaInicio, datos.horaFin)
        if (vigente) setDisponibilidad({ estado: resultado.disponible ? 'libre' : 'ocupado', mensaje: resultado.mensaje })
      } catch (error) {
        if (vigente) setDisponibilidad({ estado: 'ocupado', mensaje: error.message })
      }
    }, 500)
    return () => { vigente = false; clearTimeout(temporizador) }
  }, [datos.ambienteId, datos.fecha, datos.horaInicio, datos.horaFin])

  async function guardar(evento) {
    evento.preventDefault()
    if (enviando) return

    const erroresEncontrados = validarReserva(datos)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      setMensaje(null)
      enfocarPrimerError(erroresEncontrados, ORDEN_CAMPOS)
      return
    }
    if (disponibilidad.estado === 'ocupado') {
      setMensaje({ tipo: 'error', titulo: 'El horario no está disponible', texto: disponibilidad.mensaje + ' Elija otro horario u otro día.' })
      return
    }

    setEnviando(true)
    setMensaje(null)
    try {
      const cuerpo = {
        fecha: datos.fecha,
        horaInicio: datos.horaInicio,
        horaFin: datos.horaFin,
        motivo: datos.motivo.trim(),
        ambienteId: datos.ambienteId,
      }
      if (modoEdicion) {
        onGuardada(await actualizarReserva(reserva.id, cuerpo))
      } else {
        setCreada(await crearReserva(cuerpo))
      }
    } catch (error) {
      if (error.estado === 400 && Object.keys(error.errores).length > 0) {
        setErrores(error.errores)
        enfocarPrimerError(error.errores, ORDEN_CAMPOS)
      } else if (error.estado === 409) {
        setDisponibilidad({ estado: 'ocupado', mensaje: error.message })
        setMensaje({ tipo: 'error', titulo: 'El horario ya no está disponible', texto: error.message })
      } else {
        setMensaje({ tipo: 'error', titulo: 'No se pudo guardar la reserva', texto: error.message })
      }
    } finally {
      setEnviando(false)
    }
  }

  function nuevaReserva() {
    setCreada(null)
    setDatos({ ambienteId: '', fecha: '', horaInicio: '', horaFin: '', motivo: '' })
    setTocados({})
    setErrores({})
    setDisponibilidad({ estado: 'neutro', mensaje: '' })
  }

  const opcionesAmbiente = ambientes
    .filter((a) => a.estado === 'Disponible')
    .map((a) => ({ valor: a.id, texto: a.nombre + ' — capacidad ' + a.capacidad }))

  // ---------- Pantalla de cierre tras enviar la solicitud ----------
  if (creada) {
    return (
      <div className="confirmacion" role="status">
        <span className="confirmacion__icono" aria-hidden="true"><CircleCheck size={40} /></span>
        <h2>¡Solicitud enviada!</h2>
        <p>Su reserva quedó registrada como <strong>Pendiente</strong>. Un administrador la revisará y podrá ver su estado en «Mis reservas».</p>
        <dl className="detalle confirmacion__datos">
          <dt>Ambiente</dt><dd>{creada.ambienteNombre}</dd>
          <dt>Fecha</dt><dd>{formatearFechaLarga(creada.fecha)}</dd>
          <dt>Horario</dt><dd>{creada.horaInicio} a {creada.horaFin}</dd>
          <dt>Motivo</dt><dd>{creada.motivo}</dd>
        </dl>
        <div className="confirmacion__acciones">
          <Button texto="Ver mis reservas" to="/reservas" />
          <Button texto="Hacer otra reserva" variante="secundario" onClick={nuevaReserva} />
        </div>
      </div>
    )
  }

  const duracion = calcularDuracion(datos.horaInicio, datos.horaFin)
  const hoy = obtenerFechaHoy()

  return (
    <form className="reserva" onSubmit={guardar} noValidate aria-label={modoEdicion ? 'Modificar reserva' : 'Solicitud de reserva'}>
      <div className="reserva__campos">
        {mensaje && <AlertMessage tipo={mensaje.tipo} titulo={mensaje.titulo} mensaje={mensaje.texto} />}
        <p className="formulario__leyenda">Los campos marcados con <span aria-hidden="true">*</span><span className="solo-lector">asterisco</span> son obligatorios.</p>

        <fieldset className="grupo">
          <legend><span className="grupo__numero">1</span> ¿Qué ambiente necesita?</legend>
          <SelectInput
            etiqueta="Ambiente"
            nombre="ambienteId"
            valor={datos.ambienteId}
            onChange={manejarCambio}
            opciones={opcionesAmbiente}
            error={errores.ambienteId}
            placeholder="Elija un laboratorio, auditorio o sala"
            ayuda="Solo se muestran los ambientes disponibles."
            requerido
          />
          {ambiente && (
            <ul className="ficha-ambiente">
              <li><Building2 size={16} aria-hidden="true" /> {ambiente.tipo}</li>
              <li><Users size={16} aria-hidden="true" /> Capacidad: {ambiente.capacidad} personas</li>
              <li><MapPin size={16} aria-hidden="true" /> {ambiente.ubicacion}</li>
              {ambiente.responsableNombre && <li><UserRound size={16} aria-hidden="true" /> Responsable: {ambiente.responsableNombre}</li>}
            </ul>
          )}
        </fieldset>

        <fieldset className="grupo">
          <legend><span className="grupo__numero">2</span> ¿Cuándo lo necesita?</legend>
          <div className="atajos-fecha">
            <span>Atajos:</span>
            <button type="button" className="chip-boton" onClick={() => asignar('fecha', hoy)}>Hoy</button>
            <button type="button" className="chip-boton" onClick={() => asignar('fecha', fechaEnDias(1))}>Mañana</button>
            <button type="button" className="chip-boton" onClick={() => asignar('fecha', fechaEnDias(7))}>En una semana</button>
          </div>
          <div className="formulario__fila">
            <DateInput etiqueta="Fecha" nombre="fecha" valor={datos.fecha} onChange={manejarCambio} onBlur={marcarTocado} error={errorDe('fecha')} min={hoy} requerido />
            <TimeInput etiqueta="Hora de inicio" nombre="horaInicio" valor={datos.horaInicio} onChange={manejarCambio} onBlur={marcarTocado} error={errorDe('horaInicio')} min={HORA_APERTURA} max={HORA_CIERRE} requerido />
            <TimeInput etiqueta="Hora de fin" nombre="horaFin" valor={datos.horaFin} onChange={manejarCambio} onBlur={marcarTocado} error={errorDe('horaFin')} min={HORA_APERTURA} max={HORA_CIERRE} requerido />
          </div>

          {datos.horaInicio && !errores.horaInicio && (
            <div className="atajos-fecha">
              <span>Duración rápida:</span>
              {[1, 2, 3].map((horas) => (
                <button key={horas} type="button" className="chip-boton" onClick={() => asignar('horaFin', sumarHoras(datos.horaInicio, horas))}>
                  {horas} h
                </button>
              ))}
            </div>
          )}

          <p className="formulario__nota"><Clock size={14} aria-hidden="true" /> Las reservas se atienden de 07:00 a 22:00 horas.</p>

          {ambiente && datos.fecha && datos.fecha >= hoy && (
            <div className="grupo__linea">
              <h3 className="grupo__subtitulo">Disponibilidad de {ambiente.nombre} el {formatearFechaLarga(datos.fecha)}</h3>
              <LineaTiempoDia franjas={franjas} horaInicio={datos.horaInicio} horaFin={datos.horaFin} />
            </div>
          )}

          <EstadoDisponibilidad estado={disponibilidad.estado} mensaje={disponibilidad.mensaje} />
        </fieldset>

        <fieldset className="grupo">
          <legend><span className="grupo__numero">3</span> ¿Para qué lo necesita?</legend>
          <TextInput
            etiqueta="Motivo de la reserva"
            nombre="motivo"
            tipo="textarea"
            valor={datos.motivo}
            onChange={manejarCambio}
            onBlur={marcarTocado}
            error={errores.motivo}
            placeholder="Ejemplo: Clase de Construcción de Software"
            maxLength={MAXIMO_MOTIVO}
            mostrarContador
            requerido
          />
        </fieldset>

        <div className="formulario__acciones">
          <Button texto="Cancelar" variante="terciario" to={modoEdicion ? '/reservas' : '/inicio'} />
          <Button texto={modoEdicion ? 'Guardar cambios' : 'Enviar solicitud'} tipo="submit" cargando={enviando} textoCargando="Enviando..." />
        </div>
      </div>

      <aside className="reserva__resumen" aria-label="Resumen de la solicitud">
        <h2>Resumen de su solicitud</h2>
        <dl className="resumen">
          <dt>Solicitante</dt><dd>{usuario.nombreCompleto}</dd>
          <dt>Ambiente</dt><dd>{ambiente ? ambiente.nombre : <span className="resumen__pendiente">Sin elegir</span>}</dd>
          <dt>Fecha</dt><dd>{datos.fecha ? formatearFechaLarga(datos.fecha) : <span className="resumen__pendiente">Sin elegir</span>}</dd>
          <dt>Horario</dt><dd>{datos.horaInicio && datos.horaFin ? datos.horaInicio + ' a ' + datos.horaFin + (duracion ? ' (' + duracion + ')' : '') : <span className="resumen__pendiente">Sin elegir</span>}</dd>
        </dl>
        <div className="resumen__estado">
          <CalendarClock size={18} aria-hidden="true" />
          <span>Quedará <strong>Pendiente</strong> hasta que un administrador la apruebe.</span>
        </div>
        <h3>¿Qué sucede después?</h3>
        <ol className="resumen__pasos">
          <li>Enviamos su solicitud al administrador.</li>
          <li>La revisa y la aprueba o rechaza.</li>
          <li>Usted ve el resultado en <Link to="/reservas">{'Mis reservas'}</Link>.</li>
        </ol>
      </aside>
    </form>
  )
}

export default ReservaForm
