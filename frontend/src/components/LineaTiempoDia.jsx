import { HORA_APERTURA, HORA_CIERRE } from '../validations/reglas.js'

function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

const INICIO = aMinutos(HORA_APERTURA)
const FIN = aMinutos(HORA_CIERRE)
const TOTAL = FIN - INICIO
const MARCAS = ['07:00', '10:00', '13:00', '16:00', '19:00', '22:00']

function porcentaje(hora) {
  return ((aMinutos(hora) - INICIO) / TOTAL) * 100
}

// Línea de tiempo del día (07:00 a 22:00): muestra en rojo lo ocupado y en azul lo elegido.
// Así el usuario VE la disponibilidad en lugar de tener que imaginarla.
function LineaTiempoDia({ franjas, horaInicio, horaFin }) {
  const hayEleccion = horaInicio && horaFin && aMinutos(horaFin) > aMinutos(horaInicio)

  return (
    <div className="linea-tiempo">
      <div className="linea-tiempo__pista" role="img" aria-label={'Ocupación del ambiente: ' + (franjas.length === 0 ? 'sin reservas aprobadas.' : franjas.map((f) => f.horaInicio + ' a ' + f.horaFin).join(', '))}>
        {franjas.map((franja) => (
          <span
            key={franja.horaInicio}
            className="linea-tiempo__bloque linea-tiempo__bloque--ocupado"
            style={{ left: porcentaje(franja.horaInicio) + '%', width: porcentaje(franja.horaFin) - porcentaje(franja.horaInicio) + '%' }}
          />
        ))}
        {hayEleccion && (
          <span
            className="linea-tiempo__bloque linea-tiempo__bloque--elegido"
            style={{ left: porcentaje(horaInicio) + '%', width: porcentaje(horaFin) - porcentaje(horaInicio) + '%' }}
          />
        )}
      </div>
      <div className="linea-tiempo__marcas" aria-hidden="true">
        {MARCAS.map((marca) => (
          <span key={marca} style={{ left: porcentaje(marca) + '%' }}>{marca}</span>
        ))}
      </div>
      <ul className="linea-tiempo__leyenda">
        <li><span className="leyenda__punto leyenda__punto--ocupado" /> Ocupado (reserva aprobada)</li>
        <li><span className="leyenda__punto leyenda__punto--elegido" /> Su selección</li>
        <li><span className="leyenda__punto leyenda__punto--libre" /> Libre</li>
      </ul>
    </div>
  )
}

export default LineaTiempoDia
