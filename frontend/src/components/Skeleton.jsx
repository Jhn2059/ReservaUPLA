// Marcadores de posición mientras cargan los datos (el usuario ve que algo está pasando).
function Skeleton({ lineas = 4, alto = 20 }) {
  const filas = Array.from({ length: lineas })
  return (
    <div className="esqueleto" role="status" aria-label="Cargando información">
      {filas.map((_, indice) => (
        <span key={indice} className="esqueleto__linea" style={{ height: alto, width: 100 - (indice % 3) * 12 + '%' }} />
      ))}
    </div>
  )
}

export default Skeleton
