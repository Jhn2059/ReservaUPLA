namespace ReservaUPLA.Infrastructure.Security;

// Configuración del token de acceso (sección "Jwt" de appsettings.json).
public class JwtOpciones
{
    public string ClaveSecreta { get; set; } = string.Empty;
    public string Emisor { get; set; } = "ReservaUPLA";
    public int HorasExpiracion { get; set; } = 8;
}
