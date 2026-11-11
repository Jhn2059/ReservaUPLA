using ReservaUPLA.Application.DTOs;

namespace ReservaUPLA.Application.Interfaces;

// Contratos de los casos de uso. Los controladores solo conocen estas interfaces.

public interface IAuthService
{
    SesionDto IniciarSesion(LoginDto dto);
    UsuarioDto ObtenerUsuario(Guid usuarioId);
}

public interface IUsuarioService
{
    UsuarioDto Crear(UsuarioCrearDto dto);
    List<UsuarioDto> Listar();
}

public interface IAmbienteService
{
    AmbienteDto Crear(AmbienteCrearDto dto);
    List<AmbienteDto> Listar();
}

public interface IReservaService
{
    ReservaDto Crear(ReservaCrearDto dto, UsuarioActual actor);
    ReservaDto Actualizar(Guid id, ReservaActualizarDto dto, UsuarioActual actor);
    ReservaDto CambiarEstado(Guid id, string? nuevoEstado, UsuarioActual actor);
    ReservaDto ObtenerPorId(Guid id, UsuarioActual actor);
    List<ReservaDto> Listar(string? estado, Guid? ambienteId, bool soloMias, string? texto, UsuarioActual actor);
    DisponibilidadDto VerificarDisponibilidad(Guid? ambienteId, string? fecha, string? horaInicio, string? horaFin);
    List<FranjaOcupadaDto> ObtenerFranjasOcupadas(Guid? ambienteId, string? fecha);
}

public interface IDashboardService
{
    DashboardDto ObtenerIndicadores(UsuarioActual actor);
}
