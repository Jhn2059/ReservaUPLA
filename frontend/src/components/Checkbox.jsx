// Casilla de verificación con etiqueta grande (fácil de tocar).
// variante "interruptor": se muestra como un interruptor de encendido/apagado.
function Checkbox({ etiqueta, nombre, marcado, onChange, ayuda, variante = 'casilla' }) {
  const id = 'campo-' + nombre
  const esInterruptor = variante === 'interruptor'
  return (
    <div className={'casilla' + (esInterruptor ? ' casilla--interruptor' : '')}>
      <input
        id={id}
        name={nombre}
        type="checkbox"
        role={esInterruptor ? 'switch' : undefined}
        checked={marcado}
        onChange={onChange}
        className={'casilla__entrada' + (esInterruptor ? ' casilla__entrada--interruptor' : '')}
      />
      <label htmlFor={id} className="casilla__etiqueta">
        {etiqueta}
        {ayuda && <span className="casilla__ayuda">{ayuda}</span>}
      </label>
    </div>
  )
}

export default Checkbox
