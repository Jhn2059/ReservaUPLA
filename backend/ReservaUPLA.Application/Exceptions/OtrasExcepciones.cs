namespace ReservaUPLA.Application.Exceptions;

// El registro buscado no existe (HTTP 404).
public class NoEncontradoException : Exception
{
    public NoEncontradoException(string mensaje) : base(mensaje) { }
}

// Choque con datos existentes: reserva duplicada, correo repetido, etc. (HTTP 409).
public class ConflictoException : Exception
{
    public ConflictoException(string mensaje) : base(mensaje) { }
}

// Se incumple una regla de negocio (HTTP 422).
public class ReglaNegocioException : Exception
{
    public ReglaNegocioException(string mensaje) : base(mensaje) { }
}

// El usuario no tiene permiso para hacer la acción (HTTP 403).
public class NoAutorizadoException : Exception
{
    public NoAutorizadoException(string mensaje) : base(mensaje) { }
}

// Las credenciales no son válidas o falta iniciar sesión (HTTP 401).
public class NoAutenticadoException : Exception
{
    public NoAutenticadoException(string mensaje) : base(mensaje) { }
}

// Se superó el número de intentos de inicio de sesión (HTTP 429).
public class DemasiadosIntentosException : Exception
{
    public DemasiadosIntentosException(string mensaje) : base(mensaje) { }
}
