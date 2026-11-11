import Breadcrumbs from './Breadcrumbs.jsx'

// Encabezado de página: migas de pan, título, descripción y acciones principales.
// Todas las páginas lo usan, así el usuario siempre sabe dónde está (consistencia).
function PageHeader({ titulo, descripcion, migas, children }) {
  return (
    <header className="encabezado-pagina">
      <Breadcrumbs items={migas} />
      <div className="encabezado-pagina__fila">
        <div className="encabezado-pagina__titulos">
          <h1 id="titulo-pagina" tabIndex={-1}>{titulo}</h1>
          {descripcion && <p className="encabezado-pagina__descripcion">{descripcion}</p>}
        </div>
        {children && <div className="encabezado-pagina__acciones">{children}</div>}
      </div>
    </header>
  )
}

export default PageHeader
