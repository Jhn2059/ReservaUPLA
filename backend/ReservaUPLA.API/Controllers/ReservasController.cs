using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Security;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Authorize]
[Route("api/reservas")]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _servicio;

    public ReservasController(IReservaService servicio)
    {
        _servicio = servicio;
    }

    // GET api/reservas?estado=Pendiente&ambienteId=...&soloMias=true&texto=...   (RF-05)
    [HttpGet]
    public ActionResult<List<ReservaDto>> Listar(
        [FromQuery] string? estado, [FromQuery] Guid? ambienteId, [FromQuery] bool soloMias, [FromQuery] string? texto)
    {
        return Ok(_servicio.Listar(estado, ambienteId, soloMias, texto, User.ObtenerUsuarioActual()));
    }

    // GET api/reservas/disponibilidad?ambienteId=...&fecha=2026-11-10&horaInicio=08:00&horaFin=10:00   (RF-04)
    [HttpGet("disponibilidad")]
    public ActionResult<DisponibilidadDto> VerificarDisponibilidad(
        [FromQuery] Guid? ambienteId, [FromQuery] string? fecha, [FromQuery] string? horaInicio, [FromQuery] string? horaFin)
    {
        return Ok(_servicio.VerificarDisponibilidad(ambienteId, fecha, horaInicio, horaFin));
    }

    // GET api/reservas/ocupacion?ambienteId=...&fecha=2026-11-10   (franjas ya aprobadas ese día)
    [HttpGet("ocupacion")]
    public ActionResult<List<FranjaOcupadaDto>> ObtenerOcupacion([FromQuery] Guid? ambienteId, [FromQuery] string? fecha)
    {
        return Ok(_servicio.ObtenerFranjasOcupadas(ambienteId, fecha));
    }

    // GET api/reservas/{id}   (RF-06)
    [HttpGet("{id:guid}")]
    public ActionResult<ReservaDto> ObtenerPorId(Guid id)
    {
        return Ok(_servicio.ObtenerPorId(id, User.ObtenerUsuarioActual()));
    }

    // POST api/reservas   (RF-03)
    [HttpPost]
    public ActionResult<ReservaDto> Crear([FromBody] ReservaCrearDto dto)
    {
        ReservaDto creada = _servicio.Crear(dto, User.ObtenerUsuarioActual());
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.Id }, creada);
    }

    // PUT api/reservas/{id}   (modificar una reserva pendiente)
    [HttpPut("{id:guid}")]
    public ActionResult<ReservaDto> Actualizar(Guid id, [FromBody] ReservaActualizarDto dto)
    {
        return Ok(_servicio.Actualizar(id, dto, User.ObtenerUsuarioActual()));
    }

    // PATCH api/reservas/{id}/estado   (RF-07)
    [HttpPatch("{id:guid}/estado")]
    public ActionResult<ReservaDto> CambiarEstado(Guid id, [FromBody] CambiarEstadoDto dto)
    {
        return Ok(_servicio.CambiarEstado(id, dto.Estado, User.ObtenerUsuarioActual()));
    }
}
