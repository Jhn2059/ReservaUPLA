using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.Services;

// RF-08: indicadores básicos para el dashboard.
// Se calculan sobre las reservas que el usuario puede ver según su rol.
public class DashboardService : IDashboardService
{
    private readonly IReservaService _reservas;

    public DashboardService(IReservaService reservas)
    {
        _reservas = reservas;
    }

    public DashboardDto ObtenerIndicadores(UsuarioActual actor)
    {
        var visibles = _reservas.Listar(null, null, false, null, actor);

        var dto = new DashboardDto();
        dto.TotalReservas = visibles.Count;
        dto.Pendientes = visibles.Count(r => r.Estado == EstadosReserva.Pendiente);
        dto.Aprobadas = visibles.Count(r => r.Estado == EstadosReserva.Aprobada);
        dto.Rechazadas = visibles.Count(r => r.Estado == EstadosReserva.Rechazada);
        dto.Canceladas = visibles.Count(r => r.Estado == EstadosReserva.Cancelada);

        if (actor.Rol == RolesUsuario.Administrador)
        {
            dto.Alcance = "Todas las reservas de la universidad";
        }
        else if (actor.Rol == RolesUsuario.ResponsableAmbiente)
        {
            dto.Alcance = "Reservas de sus ambientes y reservas propias";
        }
        else
        {
            dto.Alcance = "Sus reservas";
        }

        // Ambiente más utilizado = el que tiene más reservas registradas.
        var ambienteTop = visibles
            .GroupBy(r => r.AmbienteNombre)
            .OrderByDescending(grupo => grupo.Count())
            .ThenBy(grupo => grupo.Key)
            .FirstOrDefault();

        if (ambienteTop == null)
        {
            dto.AmbienteMasUtilizado = "Sin reservas";
            dto.ReservasAmbienteMasUtilizado = 0;
        }
        else
        {
            dto.AmbienteMasUtilizado = ambienteTop.Key;
            dto.ReservasAmbienteMasUtilizado = ambienteTop.Count();
        }

        return dto;
    }
}
