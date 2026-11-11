namespace ReservaUPLA.Application.DTOs;

// Datos para registrar una reserva. El solicitante es el usuario que inició sesión.
// Fecha y horas llegan como texto (yyyy-MM-dd y HH:mm) para poder dar mensajes de error claros.
public class ReservaCrearDto
{
    public string? Fecha { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFin { get; set; }
    public string? Motivo { get; set; }
    public Guid? AmbienteId { get; set; }
}

// Datos para modificar una reserva (el solicitante no cambia).
public class ReservaActualizarDto
{
    public string? Fecha { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFin { get; set; }
    public string? Motivo { get; set; }
    public Guid? AmbienteId { get; set; }
}

public class CambiarEstadoDto
{
    public string? Estado { get; set; }
}

public class ReservaDto
{
    public Guid Id { get; set; }
    public string Fecha { get; set; } = string.Empty;
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public Guid UsuarioId { get; set; }
    public string SolicitanteNombre { get; set; } = string.Empty;
    public Guid AmbienteId { get; set; }
    public string AmbienteNombre { get; set; } = string.Empty;
}

public class DisponibilidadDto
{
    public bool Disponible { get; set; }
    public string Mensaje { get; set; } = string.Empty;
}

// Franja de un día en la que el ambiente ya tiene una reserva aprobada.
public class FranjaOcupadaDto
{
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
}
