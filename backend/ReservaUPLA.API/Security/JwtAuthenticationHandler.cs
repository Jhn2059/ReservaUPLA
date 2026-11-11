using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Security;

// Lee el encabezado "Authorization: Bearer <token>", valida el token y deja
// identificado al usuario (id, nombre y rol) para que funcione [Authorize].
public class JwtAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string Esquema = "Bearer";

    private readonly ITokenService _tokens;

    public JwtAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> opciones,
        ILoggerFactory registro,
        UrlEncoder codificador,
        ITokenService tokens) : base(opciones, registro, codificador)
    {
        _tokens = tokens;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        string? encabezado = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(encabezado) || !encabezado.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        string token = encabezado.Substring("Bearer ".Length).Trim();
        UsuarioToken? usuario = _tokens.ValidarToken(token);
        if (usuario == null)
        {
            return Task.FromResult(AuthenticateResult.Fail("Token inválido o vencido."));
        }

        var identidad = new ClaimsIdentity(Esquema);
        identidad.AddClaim(new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString()));
        identidad.AddClaim(new Claim(ClaimTypes.Name, usuario.Nombre));
        identidad.AddClaim(new Claim(ClaimTypes.Role, usuario.Rol));

        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identidad), Esquema);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    // Sin sesión válida: 401 con un mensaje claro.
    protected override async Task HandleChallengeAsync(AuthenticationProperties propiedades)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        await Response.WriteAsJsonAsync(new { mensaje = "Su sesión no es válida o ha vencido. Inicie sesión nuevamente." });
    }

    // Sesión válida pero sin permiso para la acción: 403.
    protected override async Task HandleForbiddenAsync(AuthenticationProperties propiedades)
    {
        Response.StatusCode = StatusCodes.Status403Forbidden;
        await Response.WriteAsJsonAsync(new { mensaje = "Su rol no tiene permiso para realizar esta acción." });
    }
}
