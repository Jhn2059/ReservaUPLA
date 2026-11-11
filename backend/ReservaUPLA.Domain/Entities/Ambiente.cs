namespace ReservaUPLA.Domain.Entities;

public class Ambiente
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int Capacidad { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;

    // Responsable que consulta el uso del ambiente (opcional).
    public Guid? ResponsableId { get; set; }
    public Usuario? Responsable { get; set; }
}
