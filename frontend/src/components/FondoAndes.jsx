// Ilustración vectorial de fondo: mosaico de hexágonos (como el logo de la UPLA), cordillera de Los Andes
// y un resplandor dorado al amanecer. Es el fondo por defecto del inicio de sesión.
// Si existe la fotografía /images/login-fondo.jpg, se usa encima de esta.
function FondoAndes() {
  return (
    <svg className="fondo-andes" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#031f3a" />
          <stop offset="0.55" stopColor="#04406f" />
          <stop offset="1" stopColor="#0066b1" />
        </linearGradient>
        <radialGradient id="resplandor" cx="0.78" cy="0.7" r="0.55">
          <stop offset="0" stopColor="#e5a50a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e5a50a" stopOpacity="0" />
        </radialGradient>
        <pattern id="hexagonos" width="104" height="180" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
          <path d="M52 0 L104 30 L104 90 L52 120 L0 90 L0 30Z M52 120 L52 180 M0 90 L0 150 L52 180 L104 150 L104 90" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1200" height="900" fill="url(#cielo)" />
      <rect width="1200" height="900" fill="url(#hexagonos)" />
      <rect width="1200" height="900" fill="url(#resplandor)" />
      <circle cx="930" cy="640" r="58" fill="#f6c244" opacity="0.92" />
      <path d="M0 700 L150 560 L250 640 L380 480 L500 610 L590 540 L730 690 L730 900 L0 900Z" fill="#0a6fc0" opacity="0.35" />
      <path d="M380 760 L580 520 L680 620 L800 470 L960 660 L1100 550 L1200 640 L1200 900 L380 900Z" fill="#04406f" opacity="0.8" />
      <path d="M0 800 L170 660 L290 750 L440 610 L570 740 L710 670 L870 800 L1010 710 L1200 820 L1200 900 L0 900Z" fill="#031f3a" />
      <path d="M380 480 L415 522 L392 516 L370 535 L355 510Z" fill="#ffffff" opacity="0.85" />
      <path d="M580 520 L616 560 L594 556 L576 574 L558 550Z" fill="#ffffff" opacity="0.8" />
      <path d="M800 470 L836 514 L812 508 L792 528 L775 502Z" fill="#ffffff" opacity="0.85" />
    </svg>
  )
}

export default FondoAndes
