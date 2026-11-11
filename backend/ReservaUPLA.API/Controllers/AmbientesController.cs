using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Authorize]
[Route("api/ambientes")]
public class AmbientesController : ControllerBase
{
    private readonly IAmbienteService _servicio;

    public AmbientesController(IAmbienteService servicio)
    {
        _servicio = servicio;
    }

    // GET api/ambientes  (cualquier usuario con sesión)
    [HttpGet]
    public ActionResult<List<AmbienteDto>> Listar()
    {
        return Ok(_servicio.Listar());
    }

    // POST api/ambientes  (RF-02, solo administrador)
    [Authorize(Roles = RolesUsuario.Administrador)]
    [HttpPost]
    public ActionResult<AmbienteDto> Crear([FromBody] AmbienteCrearDto dto)
    {
        AmbienteDto creado = _servicio.Crear(dto);
        return StatusCode(StatusCodes.Status201Created, creado);
    }
}
