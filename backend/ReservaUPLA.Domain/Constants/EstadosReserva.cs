namespace ReservaUPLA.Domain.Constants;

// Estados posibles de una reserva (se guardan como texto en la base de datos).
public static class EstadosReserva
{
    public const string Pendiente = "Pendiente";
    public const string Aprobada = "Aprobada";
    public const string Rechazada = "Rechazada";
    public const string Cancelada = "Cancelada";

    public static readonly string[] Todos = { Pendiente, Aprobada, Rechazada, Cancelada };
}
