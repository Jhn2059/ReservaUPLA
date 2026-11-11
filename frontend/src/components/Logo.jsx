// Logo oficial de la UPLA (archivos en public/images).
// variante: hex (solo el hexágono) | completo (con el texto UPLA) | blanco (para fondos oscuros)
const ARCHIVOS = {
  hex: '/images/logo-upla-hex.png',
  completo: '/images/logo-upla.png',
  blanco: '/images/logo-upla-blanco.png',
}

function Logo({ variante = 'hex', altura = 40 }) {
  return <img className={'logo logo--' + variante} src={ARCHIVOS[variante]} alt="UPLA" style={{ '--altura-logo': `${altura}px` }} />
}

export default Logo
