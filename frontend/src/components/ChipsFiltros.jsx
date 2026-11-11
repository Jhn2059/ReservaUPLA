import { X } from 'lucide-react'

// Muestra los filtros activos como etiquetas que se pueden quitar una por una
// (reconocer en lugar de recordar qué filtros se aplicaron).
function ChipsFiltros({ filtros, onQuitar, onLimpiar }) {
  if (filtros.length === 0) {
    return null
  }
  return (
    <div className="chips" aria-label="Filtros aplicados">
      {filtros.map((filtro) => (
        <span key={filtro.clave} className="chip">
          {filtro.texto}
          <button type="button" className="chip__quitar" onClick={() => onQuitar(filtro.clave)} aria-label={'Quitar filtro ' + filtro.texto}>
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      ))}
      <button type="button" className="chips__limpiar" onClick={onLimpiar}>Limpiar todo</button>
    </div>
  )
}

export default ChipsFiltros
