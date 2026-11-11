namespace ReservaUPLA.Application.DTOs;

public class AmbienteCrearDto
{
    public string? Nombre { get; set; }
    public string? Tipo { get; set; }
    public int? Capacidad { get; set; }
    public string? Ubicacion { get; set; }
    public string? Estado { get; set; }
    public Guid? ResponsableId { get; set; }
}

public class AmbienteDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int Capacidad { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public Guid? ResponsableId { get; set; }
    public string ResponsableNombre { get; set; } = string.Empty;
}
