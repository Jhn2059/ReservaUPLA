namespace ReservaUPLA.Application.DTOs;

public class DashboardDto
{
    // Texto que explica qué reservas se están contando según el rol del usuario.
    public string Alcance { get; set; } = string.Empty;
    public int TotalReservas { get; set; }
    public int Pendientes { get; set; }
    public int Aprobadas { get; set; }
    public int Rechazadas { get; set; }
    public int Canceladas { get; set; }
    public string AmbienteMasUtilizado { get; set; } = string.Empty;
    public int ReservasAmbienteMasUtilizado { get; set; }
}
