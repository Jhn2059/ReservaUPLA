import { CircleAlert } from 'lucide-react'

// Campo de texto reutilizable (también es la base de DateInput y TimeInput).
// Muestra la etiqueta, la ayuda, el cuadro de entrada y el mensaje de error junto al campo.
function TextInput({
  etiqueta,
  nombre,
  valor,
  onChange,
  onBlur,
  error,
  tipo = 'text',
  placeholder,
  requerido = false,
  opcional = false,
  deshabilitado = false,
  ayuda,
  maxLength,
  min,
  max,
  step,
  icono: Icono,
  autoComplete,
  inputMode,
  autoFocus = false,
  mostrarContador = false,
}) {
  const idCampo = 'campo-' + nombre
  const idError = idCampo + '-error'
  const idAyuda = idCampo + '-ayuda'

  let clase = 'campo__entrada'
  if (error) clase += ' campo__entrada--error'
  if (Icono) clase += ' campo__entrada--con-icono'

  const descripciones = [error ? idError : '', ayuda ? idAyuda : ''].filter(Boolean).join(' ')

  const propiedades = {
    id: idCampo,
    name: nombre,
    value: valor,
    onChange: onChange,
    onBlur: onBlur,
    placeholder: placeholder,
    disabled: deshabilitado,
    maxLength: maxLength,
    className: clase,
    autoComplete: autoComplete,
    autoFocus: autoFocus,
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': requerido ? 'true' : undefined,
    'aria-describedby': descripciones || undefined,
  }

  return (
    <div className="campo">
      <label className="campo__etiqueta" htmlFor={idCampo}>
        {etiqueta}
        {requerido && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
        {opcional && <span className="campo__opcional"> (opcional)</span>}
      </label>

      <div className="campo__control">
        {Icono && <Icono className="campo__icono" size={18} aria-hidden="true" />}
        {tipo === 'textarea' ? (
          <textarea {...propiedades} rows={4} />
        ) : (
          <input {...propiedades} type={tipo} min={min} max={max} step={step} inputMode={inputMode} />
        )}
      </div>

      <div className="campo__mensajes">
      {ayuda && !error && <span id={idAyuda} className="campo__ayuda">{ayuda}</span>}
      {mostrarContador && maxLength && (
        <span className="campo__contador" aria-hidden="true">{(valor || '').length}/{maxLength}</span>
      )}
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

export default TextInput
