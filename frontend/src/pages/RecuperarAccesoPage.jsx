import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, ListChecks, ShieldCheck, UserCheck } from 'lucide-react'
import CreditoFoto from '../components/CreditoFoto.jsx'
import ImagenFondo from '../components/ImagenFondo.jsx'
import Logo from '../components/Logo.jsx'

// Ayuda para quien no puede ingresar. En este prototipo el restablecimiento lo hace el administrador.
function RecuperarAccesoPage() {
  return (
    <div className="acceso acceso--simple">
      <div className="acceso__fondo-completo" aria-hidden="true">
        <ImagenFondo ruta="/images/recuperar-fondo.jpg" />
        <div className="acceso__velo" />
      </div>
      <main className="acceso__panel acceso__panel--centrado">
        <div className="acceso__tarjeta acceso__tarjeta--ancha">
          <div className="acceso__logo"><Logo variante="completo" altura={80} /></div>

          <div>
            <h1 id="titulo-pagina" tabIndex={-1}>Recuperar el acceso</h1>
            <p className="acceso__subtitulo">Siga estos pasos si no puede iniciar sesión.</p>
          </div>

          <ol className="pasos">
            <li>
              <span className="pasos__icono"><ListChecks size={22} aria-hidden="true" /></span>
              <div>
                <h2>1. Revise sus datos</h2>
                <p>Verifique que su correo termine en <strong>@upla.edu.pe</strong> y que la tecla Bloq Mayús esté desactivada. Use el botón «Mostrar» para comprobar lo que escribió.</p>
              </div>
            </li>
            <li>
              <span className="pasos__icono"><KeyRound size={22} aria-hidden="true" /></span>
              <div>
                <h2>2. Solicite una nueva contraseña</h2>
                <p>Si la olvidó, pida a la persona que administra ReservaUPLA en su facultad que restablezca su contraseña. Deberá confirmar su identidad con su correo institucional.</p>
              </div>
            </li>
            <li>
              <span className="pasos__icono"><ShieldCheck size={22} aria-hidden="true" /></span>
              <div>
                <h2>3. Si la cuenta se bloquea, espere unos minutos</h2>
                <p>Por seguridad, después de 5 intentos fallidos el acceso se bloquea durante 5 minutos. Pasado ese tiempo podrá intentarlo otra vez.</p>
              </div>
            </li>
            <li>
              <span className="pasos__icono"><UserCheck size={22} aria-hidden="true" /></span>
              <div>
                <h2>4. Cuide su cuenta</h2>
                <p>No comparta su contraseña y cierre la sesión si usa un equipo público.</p>
              </div>
            </li>
          </ol>

          <Link to="/login" className="boton boton--primario boton--lg boton--bloque">
            <ArrowLeft size={18} aria-hidden="true" /> <span>Volver al inicio de sesión</span>
          </Link>

          <CreditoFoto />
        </div>
      </main>
    </div>
  )
}

export default RecuperarAccesoPage
