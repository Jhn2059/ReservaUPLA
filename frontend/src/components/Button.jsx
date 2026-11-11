import { Link } from 'react-router-dom'

// Botón reutilizable (también puede ser un enlace si recibe "to").
// variante: primario | secundario | terciario | exito | peligro | acento
// tamano: sm | md | lg
function Button({
  texto,
  onClick,
  tipo = 'button',
  variante = 'primario',
  tamano = 'md',
  deshabilitado = false,
  cargando = false,
  textoCargando = 'Procesando...',
  icono: Icono,
  iconoDerecha: IconoDerecha,
  bloque = false,
  to,
  ayuda,
}) {
  const clases = ['boton', 'boton--' + variante, 'boton--' + tamano, bloque ? 'boton--bloque' : ''].join(' ').trim()

  const contenido = (
    <>
      {cargando ? <span className="boton__spinner" aria-hidden="true" /> : Icono && <Icono size={18} aria-hidden="true" />}
      <span>{cargando ? textoCargando : texto}</span>
      {!cargando && IconoDerecha && <IconoDerecha size={18} aria-hidden="true" />}
    </>
  )

  if (to) {
    return <Link to={to} className={clases}>{contenido}</Link>
  }

  return (
    <button
      type={tipo}
      className={clases}
      onClick={onClick}
      disabled={deshabilitado || cargando}
      aria-busy={cargando ? 'true' : undefined}
      title={ayuda}
    >
      {contenido}
    </button>
  )
}

export default Button
