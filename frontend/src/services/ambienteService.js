import { solicitar } from './apiClient.js'

export function listarAmbientes() {
  return solicitar('GET', '/api/ambientes')
}

export function crearAmbiente(datos) {
  return solicitar('POST', '/api/ambientes', datos)
}
