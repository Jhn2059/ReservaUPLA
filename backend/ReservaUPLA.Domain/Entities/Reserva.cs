namespace ReservaUPLA.Domain.Entities;

public class Reserva
{
    public Guid Id { get; set; }
    public DateOnly Fecha { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;

    // Fecha en que se registró la solicitud (trazabilidad).
    public DateTime FechaRegistro { get; set; }

    public Guid UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public Guid AmbienteId { get; set; }
    public Ambiente? Ambiente { get; set; }
}
