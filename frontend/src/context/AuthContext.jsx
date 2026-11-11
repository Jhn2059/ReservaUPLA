import { createContext, useContext, useEffect, useState } from 'react'
import { iniciarSesionApi, obtenerSesionActual } from '../services/authService.js'
import { borrarSesion, guardarSesion, obtenerTokenGuardado, registrarAlExpirarSesion } from '../services/apiClient.js'

// Guarda quién inició sesión. Todas las pantallas usan useAuth() para saber el usuario y su rol.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [sesionVencida, setSesionVencida] = useState(false)

  // Al abrir la aplicación se intenta recuperar la sesión guardada.
  useEffect(() => {
    async function recuperar() {
      if (!obtenerTokenGuardado()) {
        setCargando(false)
        return
      }
      try {
        setUsuario(await obtenerSesionActual())
      } catch {
        borrarSesion()
      } finally {
        setCargando(false)
      }
    }
    recuperar()
  }, [])

  // Si el servidor indica que la sesión venció, se cierra y se avisa en el login.
  useEffect(() => {
    registrarAlExpirarSesion(() => {
      borrarSesion()
      setUsuario(null)
      setSesionVencida(true)
    })
  }, [])

  async function iniciarSesion(correo, contrasena, recordar) {
    const sesion = await iniciarSesionApi(correo, contrasena)
    guardarSesion(sesion.token, recordar)
    setSesionVencida(false)
    setUsuario(sesion.usuario)
    return sesion.usuario
  }

  function cerrarSesion() {
    borrarSesion()
    setUsuario(null)
    setSesionVencida(false)
  }

  const valor = {
    usuario,
    cargando,
    sesionVencida,
    iniciarSesion,
    cerrarSesion,
    esAdministrador: usuario ? usuario.rol === 'Administrador' : false,
    esResponsable: usuario ? usuario.rol === 'Responsable de ambiente' : false,
    esSolicitante: usuario ? usuario.rol === 'Solicitante' : false,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
