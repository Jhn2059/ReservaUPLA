using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Security;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _servicio;

    public AuthController(IAuthService servicio)
    {
        _servicio = servicio;
    }

    // POST api/auth/login  (no requiere sesión)
    [AllowAnonymous]
    [HttpPost("login")]
    public ActionResult<SesionDto> IniciarSesion([FromBody] LoginDto dto)
    {
        return Ok(_servicio.IniciarSesion(dto));
    }

    // GET api/auth/me  (devuelve el usuario de la sesión actual)
    [Authorize]
    [HttpGet("me")]
    public ActionResult<UsuarioDto> ObtenerSesion()
    {
        return Ok(_servicio.ObtenerUsuario(User.ObtenerUsuarioActual().Id));
    }
}
