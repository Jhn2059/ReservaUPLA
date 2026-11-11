namespace ReservaUPLA.Application.DTOs;

// Datos del usuario que está usando el sistema (se obtienen del token de acceso).
public class UsuarioActual
{
    public Guid Id { get; set; }
    public string Rol { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
}

// Información que contiene un token válido.
public class UsuarioToken
{
    public Guid UsuarioId { get; set; }
    public string Rol { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
}
