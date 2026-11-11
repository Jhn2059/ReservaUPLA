namespace ReservaUPLA.Domain.Constants;

// Estados de un ambiente.
public static class EstadosAmbiente
{
    public const string Disponible = "Disponible";
    public const string Mantenimiento = "Mantenimiento";

    public static readonly string[] Todos = { Disponible, Mantenimiento };
}

// Tipos de ambiente que administra la universidad.
public static class TiposAmbiente
{
    public static readonly string[] Todos =
    {
        "Laboratorio de cómputo",
        "Auditorio",
        "Sala de reuniones",
        "Laboratorio especializado"
    };
}
