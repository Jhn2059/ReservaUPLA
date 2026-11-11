using System.Security.Claims;
using ReservaUPLA.Application.DTOs;

namespace ReservaUPLA.API.Security;

public static class UsuarioActualExtensions
{
    // Convierte la identidad del token en el "usuario actual" que usan los servicios.
    public static UsuarioActual ObtenerUsuarioActual(this ClaimsPrincipal usuario)
    {
        var actual = new UsuarioActual();
        actual.Id = Guid.Parse(usuario.FindFirstValue(ClaimTypes.NameIdentifier)!);
        actual.Nombre = usuario.FindFirstValue(ClaimTypes.Name) ?? "";
        actual.Rol = usuario.FindFirstValue(ClaimTypes.Role) ?? "";
        return actual;
    }
}
