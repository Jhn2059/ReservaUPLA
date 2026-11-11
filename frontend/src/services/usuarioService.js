import { solicitar } from './apiClient.js'

export function listarUsuarios() {
  return solicitar('GET', '/api/usuarios')
}

export function crearUsuario(datos) {
  return solicitar('POST', '/api/usuarios', datos)
}
