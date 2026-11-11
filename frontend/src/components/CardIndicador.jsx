import { Link } from 'react-router-dom'

// Tarjeta de un indicador del dashboard.
// variante: azul | amarillo | verde | rojo | gris
function CardIndicador({ titulo, valor, descripcion, variante = 'azul', icono: Icono, to }) {
  const contenido = (
    <>
      <div className="indicador__cabecera">
        <h3 className="indicador__titulo">{titulo}</h3>
        {Icono && (
          <span className="indicador__icono" aria-hidden="true">
            <Icono size={20} />
          </span>
        )}
      </div>
      <p className="indicador__valor">{valor}</p>
      {descripcion && <p className="indicador__descripcion">{descripcion}</p>}
    </>
  )

  if (to) {
    return <Link to={to} className={'indicador indicador--enlace indicador--' + variante}>{contenido}</Link>
  }
  return <article className={'indicador indicador--' + variante}>{contenido}</article>
}

export default CardIndicador
