using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.API.Security;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _servicio;

    public DashboardController(IDashboardService servicio)
    {
        _servicio = servicio;
    }

    // GET api/dashboard   (RF-08)
    [HttpGet]
    public ActionResult<DashboardDto> ObtenerIndicadores()
    {
        return Ok(_servicio.ObtenerIndicadores(User.ObtenerUsuarioActual()));
    }
}
