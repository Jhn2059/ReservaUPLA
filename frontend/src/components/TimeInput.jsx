import TextInput from './TextInput.jsx'

// Campo de hora: reutiliza TextInput con type="time" (cada 5 minutos).
function TimeInput(props) {
  return <TextInput {...props} tipo="time" step="300" />
}

export default TimeInput
