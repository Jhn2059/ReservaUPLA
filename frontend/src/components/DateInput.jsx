import TextInput from './TextInput.jsx'

// Campo de fecha: reutiliza TextInput con type="date".
function DateInput(props) {
  return <TextInput {...props} tipo="date" />
}

export default DateInput
