// Lleva el foco del teclado al primer campo que tiene error (mejora la usabilidad).
export function enfocarPrimerError(errores, ordenDeCampos) {
  for (const nombre of ordenDeCampos) {
    if (errores[nombre]) {
      const elemento = document.getElementById('campo-' + nombre)
      if (elemento) {
        elemento.focus()
      }
      return
    }
  }
}

// Actualiza un campo del formulario a partir del evento del navegador.
export function actualizarCampo(evento, datos, cambiarDatos, errores, cambiarErrores) {
  const nombre = evento.target.name
  cambiarDatos({ ...datos, [nombre]: evento.target.value })

  // Al corregir un campo, su mensaje de error desaparece.
  if (errores[nombre]) {
    const copia = { ...errores }
    delete copia[nombre]
    cambiarErrores(copia)
  }
}
