import { useState } from 'react'
import { CircleAlert, Eye, EyeOff, Lock, TriangleAlert } from 'lucide-react'

// Campo de contraseña con botón para mostrarla u ocultarla y aviso de Bloq Mayús.
// Principios aplicados: el botón es una pista visible de la acción posible (señalizador de Norman),
// la contraseña está oculta por defecto y se puede verificar para evitar errores de tipeo.
function PasswordInput({
  etiqueta = 'Contraseña',
  nombre = 'contrasena',
  valor,
  onChange,
  onBlur,
  error,
  ayuda,
  placeholder,
  deshabilitado = false,
  requerido = true,
  autoComplete = 'current-password',
  children,
}) {
  const [visible, setVisible] = useState(false)
  const [mayusculas, setMayusculas] = useState(false)

  const idCampo = 'campo-' + nombre
  const idError = idCampo + '-error'
  const idAyuda = idCampo + '-ayuda'
  const idMayus = idCampo + '-mayus'
  const descripciones = [error ? idError : '', ayuda ? idAyuda : '', mayusculas ? idMayus : ''].filter(Boolean).join(' ')

  // Detecta si la tecla Bloq Mayús está activa mientras se escribe.
  function detectarMayusculas(evento) {
    if (evento.getModifierState) {
      setMayusculas(evento.getModifierState('CapsLock'))
    }
  }

  return (
    <div className="campo">
      <label className="campo__etiqueta" htmlFor={idCampo}>
        {etiqueta}
        {requerido && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
      </label>

      <div className="campo__control">
        <Lock className="campo__icono" size={18} aria-hidden="true" />
        <input
          id={idCampo}
          name={nombre}
          type={visible ? 'text' : 'password'}
          value={valor}
          onChange={onChange}
          onBlur={(evento) => {
            setMayusculas(false)
            if (onBlur) onBlur(evento)
          }}
          onKeyUp={detectarMayusculas}
          onKeyDown={detectarMayusculas}
          placeholder={placeholder}
          disabled={deshabilitado}
          autoComplete={autoComplete}
          className={'campo__entrada campo__entrada--con-icono campo__entrada--con-accion' + (error ? ' campo__entrada--error' : '')}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={requerido ? 'true' : undefined}
          aria-describedby={descripciones || undefined}
        />
        <button
          type="button"
          className="campo__accion"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          disabled={deshabilitado}
        >
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          <span className="campo__accion-texto">{visible ? 'Ocultar' : 'Mostrar'}</span>
        </button>
      </div>

      <div className="campo__mensajes">
      {mayusculas && (
        <span id={idMayus} className="campo__aviso" role="status">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>Bloq Mayús está activado.</span>
        </span>
      )}
      {ayuda && !error && <span id={idAyuda} className="campo__ayuda">{ayuda}</span>}
      {children}
      {error && (
        <span id={idError} className="campo__error" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          <span>{error}</span>
        </span>
      )}
</div>
    </div>
  )
}

export default PasswordInput
