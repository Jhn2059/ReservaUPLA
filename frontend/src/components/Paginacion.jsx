import { ChevronLeft, ChevronRight } from 'lucide-react'

// Paginación sencilla: anterior, siguiente y el rango que se está viendo.
function Paginacion({ pagina, totalPaginas, total, tamano, onCambiar }) {
  if (totalPaginas <= 1) {
    return null
  }
  const desde = (pagina - 1) * tamano + 1
  const hasta = Math.min(pagina * tamano, total)

  return (
    <nav className="paginacion" aria-label="Paginación de resultados">
      <span className="paginacion__resumen">Mostrando {desde}–{hasta} de {total}</span>
      <div className="paginacion__botones">
        <button type="button" className="boton boton--secundario boton--sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1}>
          <ChevronLeft size={16} aria-hidden="true" /> Anterior
        </button>
        <span className="paginacion__pagina" aria-current="page">Página {pagina} de {totalPaginas}</span>
        <button type="button" className="boton boton--secundario boton--sm" onClick={() => onCambiar(pagina + 1)} disabled={pagina === totalPaginas}>
          Siguiente <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

export default Paginacion
