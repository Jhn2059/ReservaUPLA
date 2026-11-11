import { useEffect, useState } from 'react'
import { Building2, CalendarPlus, FlaskConical, Landmark, MapPin, Monitor, Plus, UserRound, Users, Wrench } from 'lucide-react'
import AlertMessage from '../components/AlertMessage.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Modal from '../components/Modal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SelectInput from '../components/SelectInput.jsx'
import Skeleton from '../components/Skeleton.jsx'
import TextInput from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { crearAmbiente, listarAmbientes } from '../services/ambienteService.js'
import { listarUsuarios } from '../services/usuarioService.js'
import { validarAmbiente } from '../validations/ambienteValidations.js'
import { ESTADOS_AMBIENTE, TIPOS_AMBIENTE } from '../validations/reglas.js'
import { actualizarCampo, enfocarPrimerError } from '../utils/formularios.js'

const DATOS_INICIALES = { nombre: '', tipo: '', capacidad: '', ubicacion: '', estado: 'Disponible', responsableId: '' }
const ORDEN_CAMPOS = ['nombre', 'tipo', 'capacidad', 'ubicacion', 'estado', 'responsableId']
const ICONOS_TIPO = { 'Laboratorio de cómputo': Monitor, Auditorio: Landmark, 'Sala de reuniones': Users, 'Laboratorio especializado': FlaskConical }

// RF-02: catálogo de ambientes (todos) y registro de ambientes (solo administrador).
function AmbientesPage() {
  const { esAdministrador } = useAuth()
  const { mostrar } = useToast()

  const [ambientes, setAmbientes] = useState([])
  const [responsables, setResponsables] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      setAmbientes(await listarAmbientes())
      setError('')
      if (esAdministrador) {
        const usuarios = await listarUsuarios()
        setResponsables(usuarios.filter((u) => u.rol === 'Responsable de ambiente' && u.activo))
      }
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function abrirFormulario() {
    setDatos(DATOS_INICIALES)
    setErrores({})
    setMensaje(null)
    setModalAbierto(true)
  }

  function manejarCambio(evento) {
    actualizarCampo(evento, datos, setDatos, errores, setErrores)
    setMensaje(null)
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (enviando) return

    const erroresEncontrados = validarAmbiente(datos)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      enfocarPrimerError(erroresEncontrados, ORDEN_CAMPOS)
      return
    }

    setEnviando(true)
    try {
      const creado = await crearAmbiente({
        nombre: datos.nombre.trim(),
        tipo: datos.tipo,
        capacidad: Number(datos.capacidad),
        ubicacion: datos.ubicacion.trim(),
        estado: datos.estado,
        responsableId: datos.responsableId || null,
      })
      mostrar('exito', 'Ambiente registrado: ' + creado.nombre + '.')
      setModalAbierto(false)
      await cargar()
    } catch (fallo) {
      if (fallo.estado === 400 && Object.keys(fallo.errores).length > 0) {
        setErrores(fallo.errores)
        enfocarPrimerError(fallo.errores, ORDEN_CAMPOS)
      } else {
        setMensaje({ tipo: 'error', texto: fallo.message })
      }
    } finally {
      setEnviando(false)
    }
  }

  const visibles = tipoFiltro ? ambientes.filter((a) => a.tipo === tipoFiltro) : ambientes

  return (
    <section>
      <PageHeader
        titulo="Ambientes"
        descripcion="Laboratorios, auditorios y salas que puede reservar."
        migas={[{ texto: 'Inicio', to: '/inicio' }, { texto: 'Ambientes' }]}
      >
        {esAdministrador && <Button texto="Registrar ambiente" icono={Plus} onClick={abrirFormulario} />}
      </PageHeader>

      <div className="segmentos" role="group" aria-label="Filtrar por tipo de ambiente">
        <button type="button" className={'segmento' + (tipoFiltro === '' ? ' segmento--activo' : '')} onClick={() => setTipoFiltro('')} aria-pressed={tipoFiltro === ''}>Todos</button>
        {TIPOS_AMBIENTE.map((tipo) => (
          <button key={tipo} type="button" className={'segmento' + (tipoFiltro === tipo ? ' segmento--activo' : '')} onClick={() => setTipoFiltro(tipo)} aria-pressed={tipoFiltro === tipo}>
            {tipo}
          </button>
        ))}
      </div>

      {error && <AlertMessage tipo="error" titulo="No se pudo cargar el catálogo" mensaje={error} />}
      {cargando && <div className="panel"><Skeleton lineas={5} alto={24} /></div>}

      {!cargando && !error && visibles.length === 0 && (
        <div className="panel"><EmptyState icono={Building2} titulo="No hay ambientes de este tipo" descripcion="Pruebe con otro tipo de ambiente." /></div>
      )}

      <ul className="tarjetas">
        {visibles.map((ambiente) => {
          const Icono = ICONOS_TIPO[ambiente.tipo] || Building2
          const disponible = ambiente.estado === 'Disponible'
          return (
            <li key={ambiente.id} className="ambiente">
              <div className="ambiente__cabecera">
                <span className="ambiente__icono" aria-hidden="true"><Icono size={26} /></span>
                <span className={'ambiente__estado ' + (disponible ? 'ambiente__estado--libre' : 'ambiente__estado--mantenimiento')}>
                  {!disponible && <Wrench size={14} aria-hidden="true" />}
                  {disponible ? 'Disponible' : 'En mantenimiento'}
                </span>
              </div>
              <h2 className="ambiente__nombre">{ambiente.nombre}</h2>
              <p className="ambiente__tipo">{ambiente.tipo}</p>
              <ul className="ambiente__datos">
                <li><Users size={16} aria-hidden="true" /> {ambiente.capacidad} personas</li>
                <li><MapPin size={16} aria-hidden="true" /> {ambiente.ubicacion}</li>
                <li><UserRound size={16} aria-hidden="true" /> {ambiente.responsableNombre || 'Sin responsable asignado'}</li>
              </ul>
              {disponible ? (
                <Button texto="Reservar" to={'/reservas/nueva?ambiente=' + ambiente.id} variante="secundario" icono={CalendarPlus} bloque />
              ) : (
                <Button texto="No disponible por ahora" variante="secundario" deshabilitado bloque />
              )}
            </li>
          )
        })}
      </ul>

      <Modal abierto={modalAbierto} titulo="Registrar ambiente" onCerrar={() => setModalAbierto(false)} ancho>
        <form className="formulario" onSubmit={guardar} noValidate>
          {mensaje && <AlertMessage tipo={mensaje.tipo} mensaje={mensaje.texto} />}
          <p className="formulario__leyenda">Los campos marcados con <span aria-hidden="true">*</span><span className="solo-lector">asterisco</span> son obligatorios.</p>
          <TextInput etiqueta="Nombre" nombre="nombre" valor={datos.nombre} onChange={manejarCambio} error={errores.nombre} maxLength={100} placeholder="Ejemplo: Laboratorio de Cómputo 3" requerido />
          <div className="formulario__fila formulario__fila--2">
            <SelectInput etiqueta="Tipo" nombre="tipo" valor={datos.tipo} onChange={manejarCambio} opciones={TIPOS_AMBIENTE.map((t) => ({ valor: t, texto: t }))} error={errores.tipo} requerido />
            <TextInput etiqueta="Capacidad (personas)" nombre="capacidad" tipo="number" min="1" max="1000" valor={datos.capacidad} onChange={manejarCambio} error={errores.capacidad} requerido />
          </div>
          <TextInput etiqueta="Ubicación" nombre="ubicacion" valor={datos.ubicacion} onChange={manejarCambio} error={errores.ubicacion} placeholder="Ejemplo: Pabellón B - Piso 2" maxLength={100} requerido />
          <div className="formulario__fila formulario__fila--2">
            <SelectInput etiqueta="Estado" nombre="estado" valor={datos.estado} onChange={manejarCambio} opciones={ESTADOS_AMBIENTE.map((e) => ({ valor: e, texto: e }))} error={errores.estado} placeholder="Seleccione el estado" />
            <SelectInput etiqueta="Responsable" nombre="responsableId" valor={datos.responsableId} onChange={manejarCambio} opciones={responsables.map((u) => ({ valor: u.id, texto: u.nombreCompleto }))} error={errores.responsableId} placeholder="Sin responsable" opcional />
          </div>
          <div className="formulario__acciones">
            <Button texto="Cancelar" variante="terciario" onClick={() => setModalAbierto(false)} deshabilitado={enviando} />
            <Button texto="Registrar ambiente" tipo="submit" cargando={enviando} textoCargando="Guardando..." />
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default AmbientesPage
