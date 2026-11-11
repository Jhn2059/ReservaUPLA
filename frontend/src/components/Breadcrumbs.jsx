import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

// Migas de pan: muestran dónde está el usuario y permiten volver (orientación).
function Breadcrumbs({ items }) {
  if (!items || items.length === 0) {
    return null
  }
  return (
    <nav className="migas" aria-label="Ruta de navegación">
      <ol className="migas__lista">
        {items.map((item, indice) => {
          const esUltimo = indice === items.length - 1
          return (
            <li key={item.texto} className="migas__item">
              {esUltimo || !item.to ? (
                <span aria-current={esUltimo ? 'page' : undefined}>{item.texto}</span>
              ) : (
                <Link to={item.to}>{item.texto}</Link>
              )}
              {!esUltimo && <ChevronRight size={14} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
