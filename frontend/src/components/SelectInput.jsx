import { CircleAlert } from 'lucide-react'

// Lista desplegable reutilizable.
// opciones: arreglo de objetos { valor, texto }
function SelectInput({
  etiqueta,
  nombre,
  valor,
  onChange,
  opciones,
  error,
  placeholder = 'Seleccione...',
  requerido = false,
  opcional = false,
  deshabilitado = false,
  ayuda,
  ocultarEtiqueta = false,
}) {
  const idCampo = 'campo-' + nombre
  const idError = idCampo + '-error'
  const idAyuda = idCampo + '-ayuda'
  const descripciones = [error ? idError : '', ayuda ? idAyuda : ''].filter(Boolean).join(' ')

  return (
    <div className="campo">
      <label className={ocultarEtiqueta ? 'solo-lector' : 'campo__etiqueta'} htmlFor={idCampo}>
        {etiqueta}
        {requerido && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
        {opcional && <span className="campo__opcional"> (opcional)</span>}
      </label>

      <select
        id={idCampo}
        name={nombre}
        value={valor}
        onChange={onChange}
        disabled={deshabilitado}
        className={'campo__entrada campo__entrada--select' + (error ? ' campo__entrada--error' : '')}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={requerido ? 'true' : undefined}
        aria-describedby={descripciones || undefined}
      >
        <option value="">{placeholder}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>

      <div className="campo__mensajes">
      {ayuda && !error && <span id={idAyuda} className="campo__ayuda">{ayuda}</span>}
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

export default SelectInput
