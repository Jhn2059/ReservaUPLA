namespace ReservaUPLA.Application.DTOs;

public class LoginDto
{
    public string? Correo { get; set; }
    public string? Contrasena { get; set; }
}

public class SesionDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiraEn { get; set; }
    public UsuarioDto Usuario { get; set; } = new UsuarioDto();
}
