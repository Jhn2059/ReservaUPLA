import { CircleCheck, FlaskConical, Landmark, Monitor, Users } from 'lucide-react'
import ImagenFondo from './ImagenFondo.jsx'
import Logo from './Logo.jsx'

// Panel visual del inicio de sesión. Muestra, con tarjetas de cristal, lo que hace el sistema
// (disponibilidad de un ambiente y una reserva aprobada) para que el usuario entienda el servicio
// antes de ingresar. Es decorativo: no contiene controles.
function HeroAcceso() {
  return (
    <aside className="hero">
      <ImagenFondo />
      <div className="hero__velo" />
      <div className="hero__contenido">
        <Logo variante="blanco" altura={74} />

        <div className="hero__texto">
          <p className="hero__etiqueta">Universidad Peruana Los Andes</p>
          <p className="hero__titular">Reserva tu espacio, <span>impulsa tu aprendizaje</span></p>
          <p className="hero__subtitulo">Laboratorios, auditorios y salas de la UPLA, disponibles a un clic.</p>
        </div>

        <div className="hero__vitrina" aria-hidden="true">
          <article className="vidrio vidrio--a">
            <header className="vidrio__cabecera">
              <span className="vidrio__icono"><Monitor size={18} /></span>
              <div>
                <strong>Laboratorio de Cómputo 1</strong>
                <small>Pabellón B · 30 personas</small>
              </div>
              <span className="vidrio__chip vidrio__chip--libre">Disponible</span>
            </header>
            <div className="mini">
              <span className="mini__bloque mini__bloque--ocupado" style={{ left: '8%', width: '18%' }} />
              <span className="mini__bloque mini__bloque--ocupado" style={{ left: '52%', width: '14%' }} />
              <span className="mini__bloque mini__bloque--elegido" style={{ left: '30%', width: '16%' }} />
            </div>
            <div className="mini__horas"><span>07:00</span><span>14:30</span><span>22:00</span></div>
          </article>

          <article className="vidrio vidrio--b">
            <span className="vidrio__ok"><CircleCheck size={22} /></span>
            <div>
              <strong>Reserva aprobada</strong>
              <small>Auditorio Central · 14:00 – 17:00</small>
            </div>
          </article>
        </div>

        <ul className="hero__tipos" aria-label="Tipos de ambientes">
          <li><Monitor size={16} aria-hidden="true" /> Laboratorios de cómputo</li>
          <li><Landmark size={16} aria-hidden="true" /> Auditorios</li>
          <li><Users size={16} aria-hidden="true" /> Salas de reuniones</li>
          <li><FlaskConical size={16} aria-hidden="true" /> Laboratorios especializados</li>
        </ul>

        <p className="hero__pie">Huancayo · Junín · Perú</p>
      </div>
    </aside>
  )
}

export default HeroAcceso
