import { solicitar } from './apiClient.js'

export function obtenerIndicadores() {
  return solicitar('GET', '/api/dashboard')
}
