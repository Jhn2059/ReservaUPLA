using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.API.Controllers;

// La administración de usuarios es exclusiva del administrador.
[ApiController]
[Authorize(Roles = RolesUsuario.Administrador)]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _servicio;

    public UsuariosController(IUsuarioService servicio)
    {
        _servicio = servicio;
    }

    // GET api/usuarios
    [HttpGet]
    public ActionResult<List<UsuarioDto>> Listar()
    {
        return Ok(_servicio.Listar());
    }

    // POST api/usuarios  (RF-01)
    [HttpPost]
    public ActionResult<UsuarioDto> Crear([FromBody] UsuarioCrearDto dto)
    {
        UsuarioDto creado = _servicio.Crear(dto);
        return StatusCode(StatusCodes.Status201Created, creado);
    }
}
