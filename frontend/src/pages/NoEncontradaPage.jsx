import { SearchX } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'

function NoEncontradaPage() {
  return (
    <section>
      <PageHeader titulo="Página no encontrada" />
      <EmptyState icono={SearchX} titulo="No encontramos lo que busca" descripcion="La dirección puede estar mal escrita o la página ya no existe.">
        <Button texto="Ir al inicio" to="/inicio" />
      </EmptyState>
    </section>
  )
}

export default NoEncontradaPage
