namespace ReservaUPLA.Domain.Constants;

// Roles (actores) del sistema.
public static class RolesUsuario
{
    public const string Solicitante = "Solicitante";
    public const string Administrador = "Administrador";
    public const string ResponsableAmbiente = "Responsable de ambiente";

    public static readonly string[] Todos = { Solicitante, Administrador, ResponsableAmbiente };
}
