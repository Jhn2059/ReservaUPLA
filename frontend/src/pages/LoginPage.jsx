import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound, LogIn, Mail, ShieldCheck, UserRound } from 'lucide-react'
import AlertMessage from '../components/AlertMessage.jsx'
import Button from '../components/Button.jsx'
import Checkbox from '../components/Checkbox.jsx'
import CreditoFoto from '../components/CreditoFoto.jsx'
import HeroAcceso from '../components/HeroAcceso.jsx'
import Logo from '../components/Logo.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import TextInput from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { validarCampoLogin, validarLogin } from '../validations/loginValidations.js'
import { enfocarPrimerError } from '../utils/formularios.js'

const CUENTAS_DEMO = [
  { rol: 'Administrador', nombre: 'Rosa Medina', correo: 'rmedina@upla.edu.pe' },
  { rol: 'Responsable de ambiente', nombre: 'Carlos Quispe', correo: 'cquispe@upla.edu.pe' },
  { rol: 'Solicitante', nombre: 'Ana Torres', correo: 'atorres@upla.edu.pe' },
]
const CONTRASENA_DEMO = 'Upla2026!'
const MODO_DEMO = import.meta.env.VITE_MODO_DEMO !== 'false'

// Pantalla de inicio de sesión.
// Heurísticas de Nielsen: estado visible (botón "Verificando"), prevención de errores (tipo de campo,
// autocompletado), reconocer antes que recordar (etiquetas visibles, ejemplo), ayuda para recuperarse
// de errores (mensajes claros, foco al campo), control del usuario (mostrar contraseña, enlace de ayuda).
function LoginPage() {
  const { iniciarSesion, sesionVencida } = useAuth()
  const { mostrar } = useToast()
  const navegar = useNavigate()
  const ubicacion = useLocation()

  const [datos, setDatos] = useState({ correo: '', contrasena: '' })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [recordar, setRecordar] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (sesionVencida) {
      setMensaje({ tipo: 'info', titulo: 'Su sesión venció', texto: 'Por su seguridad, inicie sesión nuevamente para continuar.' })
    }
  }, [sesionVencida])

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setDatos({ ...datos, [name]: value })
    if (errores[name]) {
      const copia = { ...errores }
      delete copia[name]
      setErrores(copia)
    }
  }

  // Valida solo el campo que el usuario acaba de dejar (no muestra errores de campos sin visitar).
  function validarAlSalir(evento) {
    const { name, value } = evento.target
    const error = validarCampoLogin(name, value)
    if (error) {
      setErrores({ ...errores, [name]: error })
    }
  }

  function usarCuentaDemo(correo) {
    setDatos({ correo, contrasena: CONTRASENA_DEMO })
    setErrores({})
    setMensaje(null)
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return

    const erroresEncontrados = validarLogin(datos)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      setMensaje(null)
      enfocarPrimerError(erroresEncontrados, ['correo', 'contrasena'])
      return
    }

    setEnviando(true)
    setMensaje(null)
    try {
      const usuario = await iniciarSesion(datos.correo.trim(), datos.contrasena, recordar)
      mostrar('exito', 'Bienvenido(a), ' + usuario.nombreCompleto.split(' ')[0] + '.')
      const destino = ubicacion.state && ubicacion.state.desde ? ubicacion.state.desde : '/inicio'
      navegar(destino, { replace: true })
    } catch (error) {
      if (error.estado === 400 && Object.keys(error.errores).length > 0) {
        setErrores(error.errores)
        enfocarPrimerError(error.errores, ['correo', 'contrasena'])
      } else if (error.estado === 429) {
        setMensaje({ tipo: 'advertencia', titulo: 'Acceso bloqueado temporalmente', texto: error.message })
      } else {
        // Credenciales inválidas o falla de conexión: se limpia la contraseña y el foco vuelve a ella.
        setMensaje({ tipo: 'error', titulo: error.estado === 401 ? 'No pudimos iniciar su sesión' : 'No hay conexión con el servidor', texto: error.message })
        if (error.estado === 401) {
          setDatos({ ...datos, contrasena: '' })
          setTimeout(() => {
            const campo = document.getElementById('campo-contrasena')
            if (campo) campo.focus()
          }, 0)
        }
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="acceso">
      <HeroAcceso />

      <main className="acceso__panel">
        <div className="acceso__tarjeta">
          <div className="acceso__logo">
            <Logo variante="completo" altura={92} />
          </div>

          <form onSubmit={enviar} noValidate aria-labelledby="titulo-pagina" className="acceso__formulario">
            <div className="acceso__encabezado">
              <h1 id="titulo-pagina" tabIndex={-1}>Iniciar sesión</h1>
              <p className="acceso__subtitulo">Bienvenido(a) a <strong>ReservaUPLA</strong>. Ingrese con su correo institucional.</p>
            </div>

            {mensaje && <AlertMessage tipo={mensaje.tipo} titulo={mensaje.titulo} mensaje={mensaje.texto} />}

            <TextInput
              etiqueta="Correo institucional"
              nombre="correo"
              tipo="email"
              valor={datos.correo}
              onChange={manejarCambio}
              onBlur={validarAlSalir}
              error={errores.correo}
              placeholder="nombre.apellido@upla.edu.pe"
              autoComplete="username"
              inputMode="email"
              icono={Mail}
              deshabilitado={enviando}
              autoFocus
              requerido
            />

            <PasswordInput
              valor={datos.contrasena}
              onChange={manejarCambio}
              onBlur={validarAlSalir}
              error={errores.contrasena}
              deshabilitado={enviando}
            />

            <div className="acceso__opciones">
              <Checkbox variante="interruptor" etiqueta="Mantener la sesión iniciada" nombre="recordar" marcado={recordar} onChange={(e) => setRecordar(e.target.checked)} />
            </div>

            <Button texto="Ingresar" tipo="submit" variante="marca" bloque tamano="lg" cargando={enviando} textoCargando="Verificando sus datos..." iconoDerecha={ArrowRight} />

            <Link to="/recuperar-acceso" className="acceso__olvido">
              <KeyRound size={18} aria-hidden="true" />
              <span>¿Olvidó su contraseña? <strong>Vea cómo recuperarla</strong></span>
            </Link>
          </form>

          {MODO_DEMO && (
            <details className="demo">
              <summary>
                <UserRound size={18} aria-hidden="true" />
                Cuentas de demostración
              </summary>
              <p className="demo__texto">Solo para la presentación del proyecto. Todas usan la contraseña <code>{CONTRASENA_DEMO}</code>.</p>
              <ul className="demo__lista">
                {CUENTAS_DEMO.map((cuenta) => (
                  <li key={cuenta.correo}>
                    <div>
                      <strong>{cuenta.nombre}</strong>
                      <span>{cuenta.rol}</span>
                    </div>
                    <button type="button" className="demo__usar" onClick={() => usarCuentaDemo(cuenta.correo)} disabled={enviando}>
                      <LogIn size={16} aria-hidden="true" /> Usar
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="acceso__seguridad">
            <ShieldCheck size={24} aria-hidden="true" />
            <span><strong>Plataforma segura y confiable</strong><small>Sus datos están protegidos. Los campos con * son obligatorios.</small></span>
          </p>

          <CreditoFoto />
        </div>
      </main>
    </div>
  )
}

export default LoginPage
