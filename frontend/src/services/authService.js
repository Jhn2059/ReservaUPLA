import { solicitar } from './apiClient.js'

export function iniciarSesionApi(correo, contrasena) {
  return solicitar('POST', '/api/auth/login', { correo, contrasena }, true)
}

export function obtenerSesionActual() {
  return solicitar('GET', '/api/auth/me')
}
