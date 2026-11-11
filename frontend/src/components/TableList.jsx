// Tabla reutilizable.
// columnas: arreglo de { clave, titulo, render? }. Si hay "render", se usa para dibujar la celda.
function TableList({ columnas, filas, caption, claveFila = 'id', onFilaClick }) {
  return (
    <div className="tabla__contenedor">
      <table className="tabla">
        {caption && <caption className="solo-lector">{caption}</caption>}
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna.clave} scope="col">{columna.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila[claveFila]} className={onFilaClick ? 'tabla__fila-clic' : undefined} onClick={onFilaClick ? () => onFilaClick(fila) : undefined}>
              {columnas.map((columna) => (
                <td key={columna.clave} data-etiqueta={columna.titulo}>
                  {columna.render ? columna.render(fila) : fila[columna.clave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableList
