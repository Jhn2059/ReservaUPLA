using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Security;

// Token de acceso con el formato JWT (cabecera.carga.firma) firmado con HMAC-SHA256.
// El servidor firma el token al iniciar sesión y lo verifica en cada petición:
// si alguien cambia el rol dentro del token, la firma deja de coincidir y se rechaza.
public class JwtTokenService : ITokenService
{
    private readonly byte[] _clave;
    private readonly JwtOpciones _opciones;

    public JwtTokenService(JwtOpciones opciones)
    {
        if (string.IsNullOrWhiteSpace(opciones.ClaveSecreta) || opciones.ClaveSecreta.Length < 32)
        {
            throw new InvalidOperationException("La clave secreta del token (Jwt:ClaveSecreta) debe tener al menos 32 caracteres.");
        }
        _opciones = opciones;
        _clave = Encoding.UTF8.GetBytes(opciones.ClaveSecreta);
    }

    public string GenerarToken(Usuario usuario, out DateTime expiraEn)
    {
        expiraEn = DateTime.UtcNow.AddHours(_opciones.HorasExpiracion);

        var cabecera = new Dictionary<string, object> { ["alg"] = "HS256", ["typ"] = "JWT" };
        var carga = new Dictionary<string, object>
        {
            ["iss"] = _opciones.Emisor,
            ["sub"] = usuario.Id.ToString(),
            ["name"] = usuario.NombreCompleto,
            ["role"] = usuario.Rol,
            ["iat"] = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds(),
            ["exp"] = new DateTimeOffset(expiraEn).ToUnixTimeSeconds()
        };

        string parteCabecera = ABase64Url(JsonSerializer.SerializeToUtf8Bytes(cabecera));
        string parteCarga = ABase64Url(JsonSerializer.SerializeToUtf8Bytes(carga));
        string firma = ABase64Url(Firmar(parteCabecera + "." + parteCarga));

        return parteCabecera + "." + parteCarga + "." + firma;
    }

    public UsuarioToken? ValidarToken(string token)
    {
        try
        {
            string[] partes = token.Split('.');
            if (partes.Length != 3)
            {
                return null;
            }

            // 1) La firma debe coincidir (comparación en tiempo constante).
            byte[] firmaEsperada = Firmar(partes[0] + "." + partes[1]);
            byte[] firmaRecibida = DesdeBase64Url(partes[2]);
            if (!CryptographicOperations.FixedTimeEquals(firmaEsperada, firmaRecibida))
            {
                return null;
            }

            // 2) El token no debe haber expirado.
            using JsonDocument carga = JsonDocument.Parse(DesdeBase64Url(partes[1]));
            JsonElement raiz = carga.RootElement;

            long expiracion = raiz.GetProperty("exp").GetInt64();
            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() >= expiracion)
            {
                return null;
            }

            var resultado = new UsuarioToken();
            resultado.UsuarioId = Guid.Parse(raiz.GetProperty("sub").GetString()!);
            resultado.Nombre = raiz.GetProperty("name").GetString() ?? "";
            resultado.Rol = raiz.GetProperty("role").GetString() ?? "";
            return resultado;
        }
        catch
        {
            // Cualquier token mal formado se considera inválido.
            return null;
        }
    }

    private byte[] Firmar(string texto)
    {
        using var hmac = new HMACSHA256(_clave);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(texto));
    }

    private static string ABase64Url(byte[] datos)
    {
        return Convert.ToBase64String(datos).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static byte[] DesdeBase64Url(string texto)
    {
        string base64 = texto.Replace('-', '+').Replace('_', '/');
        switch (base64.Length % 4)
        {
            case 2: base64 += "=="; break;
            case 3: base64 += "="; break;
        }
        return Convert.FromBase64String(base64);
    }
}
