// Estado vacío: explica por qué no hay datos y qué puede hacer el usuario.
function EmptyState({ icono: Icono, titulo, descripcion, children }) {
  return (
    <div className="vacio">
      {Icono && (
        <span className="vacio__icono" aria-hidden="true">
          <Icono size={32} />
        </span>
      )}
      <h3 className="vacio__titulo">{titulo}</h3>
      {descripcion && <p className="vacio__texto">{descripcion}</p>}
      {children && <div className="vacio__acciones">{children}</div>}
    </div>
  )
}

export default EmptyState
