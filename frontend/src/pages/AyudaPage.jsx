import { CalendarPlus, ClipboardCheck, Search } from 'lucide-react'
import BadgeEstado from '../components/BadgeEstado.jsx'
import PageHeader from '../components/PageHeader.jsx'

// Centro de ayuda: explica el sistema con las mismas palabras que usa el usuario (Nielsen 10).
function AyudaPage() {
  return (
    <section>
      <PageHeader titulo="Centro de ayuda" descripcion="Todo lo necesario para reservar un ambiente sin dudas." migas={[{ texto: 'Inicio', to: '/inicio' }, { texto: 'Centro de ayuda' }]} />

      <div className="panel">
        <h2 className="panel__titulo">Cómo reservar en 3 pasos</h2>
        <ol className="pasos pasos--horizontal">
          <li>
            <span className="pasos__icono"><Search size={22} aria-hidden="true" /></span>
            <div><h3>1. Elija el ambiente</h3><p>En «Reservar un ambiente» seleccione el laboratorio, auditorio o sala que necesita.</p></div>
          </li>
          <li>
            <span className="pasos__icono"><CalendarPlus size={22} aria-hidden="true" /></span>
            <div><h3>2. Indique fecha y horario</h3><p>La línea de tiempo le muestra qué horas están libres y comprobamos la disponibilidad automáticamente.</p></div>
          </li>
          <li>
            <span className="pasos__icono"><ClipboardCheck size={22} aria-hidden="true" /></span>
            <div><h3>3. Envíe la solicitud</h3><p>Escriba el motivo y envíe. Un administrador la aprobará o rechazará.</p></div>
          </li>
        </ol>
      </div>

      <div className="rejilla-2">
        <div className="panel">
          <h2 className="panel__titulo">Estados de una reserva</h2>
          <ul className="leyenda-estados">
            <li><BadgeEstado estado="Pendiente" /><span>Esperando la decisión del administrador. Puede modificarla o cancelarla.</span></li>
            <li><BadgeEstado estado="Aprobada" /><span>Confirmada. El horario queda bloqueado para otras solicitudes. Solo puede cancelarse.</span></li>
            <li><BadgeEstado estado="Rechazada" /><span>No fue autorizada. Ya no puede modificarse; haga una nueva solicitud si lo necesita.</span></li>
            <li><BadgeEstado estado="Cancelada" /><span>Anulada por el solicitante o un administrador. No se puede reactivar.</span></li>
          </ul>
        </div>

        <div className="panel">
          <h2 className="panel__titulo">Reglas del sistema</h2>
          <ul className="lista-reglas">
            <li>Las reservas se atienden de <strong>07:00 a 22:00</strong> horas.</li>
            <li>La hora de fin debe ser posterior a la de inicio.</li>
            <li>No puede haber dos reservas <strong>aprobadas</strong> para el mismo ambiente, fecha y horario.</li>
            <li>Solo un <strong>administrador</strong> puede aprobar o rechazar solicitudes.</li>
            <li>No se pueden reservar ambientes en mantenimiento ni fechas pasadas.</li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel__titulo">Preguntas frecuentes</h2>
        <div className="faq">
          <details>
            <summary>¿Por qué no puedo aprobar una reserva?</summary>
            <p>Solo los administradores pueden aprobar o rechazar. Si su solicitud sigue pendiente, espere la decisión o comuníquese con la persona que administra el sistema.</p>
          </details>
          <details>
            <summary>¿Qué pasa si el horario que quiero ya está ocupado?</summary>
            <p>El sistema se lo indica antes de enviar la solicitud y muestra en la línea de tiempo qué horas están libres. Elija otro horario u otro ambiente.</p>
          </details>
          <details>
            <summary>¿Puedo cambiar una reserva ya enviada?</summary>
            <p>Sí, mientras esté <strong>Pendiente</strong>: abra su detalle y use «Modificar». Si ya fue aprobada, solo puede cancelarla.</p>
          </details>
          <details>
            <summary>Olvidé mi contraseña, ¿qué hago?</summary>
            <p>Pida a la persona que administra el sistema en su facultad que la restablezca. Por seguridad, tras 5 intentos fallidos el acceso se bloquea 5 minutos.</p>
          </details>
        </div>
      </div>
    </section>
  )
}

export default AyudaPage
