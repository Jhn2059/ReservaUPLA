import Modal from './Modal.jsx'
import Button from './Button.jsx'

// Ventana para confirmar una acción importante (aprobar, rechazar, cancelar...).
// Explica qué va a pasar y permite volver atrás sin consecuencias (control del usuario).
function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  detalle,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Volver',
  variante = 'primario',
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCancelar}
      acciones={
        <>
          <Button texto={textoCancelar} variante="secundario" onClick={onCancelar} deshabilitado={cargando} />
          <Button texto={textoConfirmar} variante={variante} onClick={onConfirmar} cargando={cargando} />
        </>
      }
    >
      <p>{mensaje}</p>
      {detalle && <p className="modal__detalle">{detalle}</p>}
    </Modal>
  )
}

export default ModalConfirmacion
