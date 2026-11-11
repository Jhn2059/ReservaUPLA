import { useEffect, useState } from 'react'
import { Check, Plus, Search, UserRound, X } from 'lucide-react'
import AlertMessage from '../components/AlertMessage.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Modal from '../components/Modal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import SelectInput from '../components/SelectInput.jsx'
import Skeleton from '../components/Skeleton.jsx'
import TableList from '../components/TableList.jsx'
import TextInput from '../components/TextInput.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { crearUsuario, listarUsuarios } from '../services/usuarioService.js'
import { evaluarContrasena } from '../validations/contrasenaValidations.js'
import { validarUsuario } from '../validations/usuarioValidations.js'
import { ROLES } from '../validations/reglas.js'
import { actualizarCampo, enfocarPrimerError } from '../utils/formularios.js'

const DATOS_INICIALES = { nombreCompleto: '', correo: '', rol: 'Solicitante', contrasena: '' }
const ORDEN_CAMPOS = ['nombreCompleto', 'correo', 'rol', 'contrasena']

// RF-01: registrar usuarios (solo administrador).
function UsuariosPage() {
  const { mostrar } = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      setUsuarios(await listarUsuarios())
      setError('')
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

    const erroresEncontrados = validarUsuario(datos)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      enfocarPrimerError(erroresEncontrados, ORDEN_CAMPOS)
      return
    }

    setEnviando(true)
    try {
      const creado = await crearUsuario({
        nombreCompleto: datos.nombreCompleto.trim(),
        correo: datos.correo.trim(),
        rol: datos.rol,
        contrasena: datos.contrasena,
      })
      mostrar('exito', 'Usuario registrado: ' + creado.nombreCompleto + '.')
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

  const texto = busqueda.trim().toLowerCase()
  const visibles = usuarios.filter((u) => !texto || u.nombreCompleto.toLowerCase().includes(texto) || u.correo.toLowerCase().includes(texto) || u.rol.toLowerCase().includes(texto))

  const columnas = [
    { clave: 'nombreCompleto', titulo: 'Nombre completo' },
    { clave: 'correo', titulo: 'Correo' },
    { clave: 'rol', titulo: 'Rol', render: (fila) => <span className="rol-chip">{fila.rol}</span> },
    { clave: 'activo', titulo: 'Estado', render: (fila) => (fila.activo ? 'Activo' : 'Inactivo') },
  ]

  const requisitos = evaluarContrasena(datos.contrasena)

  return (
    <section>
      <PageHeader
        titulo="Usuarios"
        descripcion="Registre solicitantes, administradores y responsables de ambiente."
        migas={[{ texto: 'Inicio', to: '/inicio' }, { texto: 'Administración' }, { texto: 'Usuarios' }]}
      >
        <Button texto="Registrar usuario" icono={Plus} onClick={abrirFormulario} />
      </PageHeader>

      <div className="panel filtros filtros--una">
        <TextInput etiqueta="Buscar usuario" nombre="busqueda" valor={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, correo o rol" icono={Search} />
      </div>

      {error && <AlertMessage tipo="error" titulo="No se pudo cargar la lista" mensaje={error} />}

      <div className="panel">
        <p className="panel__resumen" aria-live="polite">{cargando ? 'Cargando usuarios...' : visibles.length + ' usuario(s)'}</p>
        {cargando && <Skeleton lineas={5} alto={26} />}
        {!cargando && visibles.length === 0 && <EmptyState icono={UserRound} titulo="No se encontraron usuarios" descripcion="Pruebe con otra búsqueda." />}
        {!cargando && visibles.length > 0 && <TableList columnas={columnas} filas={visibles} caption="Usuarios registrados" />}
      </div>

      <Modal abierto={modalAbierto} titulo="Registrar usuario" onCerrar={() => setModalAbierto(false)} ancho>
        <form className="formulario" onSubmit={guardar} noValidate>
          {mensaje && <AlertMessage tipo={mensaje.tipo} mensaje={mensaje.texto} />}
          <p className="formulario__leyenda">Los campos marcados con <span aria-hidden="true">*</span><span className="solo-lector">asterisco</span> son obligatorios.</p>
          <TextInput etiqueta="Nombre completo" nombre="nombreCompleto" valor={datos.nombreCompleto} onChange={manejarCambio} error={errores.nombreCompleto} maxLength={150} requerido />
          <TextInput etiqueta="Correo institucional" nombre="correo" tipo="email" valor={datos.correo} onChange={manejarCambio} error={errores.correo} placeholder="nombre.apellido@upla.edu.pe" maxLength={150} autoComplete="off" requerido />
          <SelectInput etiqueta="Rol" nombre="rol" valor={datos.rol} onChange={manejarCambio} opciones={ROLES.map((r) => ({ valor: r, texto: r }))} error={errores.rol} requerido />
          <PasswordInput etiqueta="Contraseña inicial" nombre="contrasena" valor={datos.contrasena} onChange={manejarCambio} error={errores.contrasena} autoComplete="new-password">
            <ul className="requisitos" aria-label="Requisitos de la contraseña">
              {requisitos.map((requisito) => (
                <li key={requisito.texto} className={requisito.cumple ? 'requisitos__item requisitos__item--cumple' : 'requisitos__item'}>
                  {requisito.cumple ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
                  {requisito.texto}
                  <span className="solo-lector">{requisito.cumple ? ' (cumplido)' : ' (pendiente)'}</span>
                </li>
              ))}
            </ul>
          </PasswordInput>
          <div className="formulario__acciones">
            <Button texto="Cancelar" variante="terciario" onClick={() => setModalAbierto(false)} deshabilitado={enviando} />
            <Button texto="Registrar usuario" tipo="submit" cargando={enviando} textoCargando="Guardando..." />
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default UsuariosPage
