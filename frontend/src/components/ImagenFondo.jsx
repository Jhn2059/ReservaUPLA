import { useState } from 'react'
import FondoAndes from './FondoAndes.jsx'

// Muestra la foto del campus si existe en public/images; si no, usa la ilustración vectorial.
function ImagenFondo({ ruta = '/images/login-fondo.jpg' }) {
  const [fallo, setFallo] = useState(false)

  if (fallo) {
    return <FondoAndes />
  }

  return (
    <>
      <FondoAndes />
      <img className="fondo-foto" src={ruta} alt="" onError={() => setFallo(true)} onLoad={(e) => e.target.classList.add('fondo-foto--lista')} />
    </>
  )
}

export default ImagenFondo
