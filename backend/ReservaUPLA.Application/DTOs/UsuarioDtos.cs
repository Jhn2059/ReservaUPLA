namespace ReservaUPLA.Application.DTOs;

public class UsuarioCrearDto
{
    public string? NombreCompleto { get; set; }
    public string? Correo { get; set; }
    public string? Rol { get; set; }
    public string? Contrasena { get; set; }
}

public class UsuarioDto
{
    public Guid Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Activo { get; set; }
}
