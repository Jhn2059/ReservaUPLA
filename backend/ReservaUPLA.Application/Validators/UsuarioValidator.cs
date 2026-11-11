using System.Text.RegularExpressions;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.Validators;

// Validaciones del registro de usuarios (RF-01).
// Devuelve un diccionario campo -> mensaje. Si está vacío, los datos son válidos.
public static class UsuarioValidator
{
    private const string ExpresionCorreo = @"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$";

    public static Dictionary<string, string> Validar(UsuarioCrearDto dto)
    {
        var errores = new Dictionary<string, string>();

        string nombre = (dto.NombreCompleto ?? "").Trim();
        string correo = (dto.Correo ?? "").Trim();
        string rol = (dto.Rol ?? "").Trim();

        if (nombre == "")
        {
            errores["nombreCompleto"] = "El nombre completo es obligatorio.";
        }
        else if (nombre.Length > 150)
        {
            errores["nombreCompleto"] = "El nombre completo no puede superar los 150 caracteres.";
        }

        if (correo == "")
        {
            errores["correo"] = "El correo es obligatorio.";
        }
        else if (!Regex.IsMatch(correo, ExpresionCorreo))
        {
            errores["correo"] = "El correo no tiene un formato válido. Ejemplo: nombre.apellido@upla.edu.pe";
        }
        else if (correo.Length > 150)
        {
            errores["correo"] = "El correo no puede superar los 150 caracteres.";
        }

        if (rol == "")
        {
            errores["rol"] = "Debe seleccionar un rol.";
        }
        else if (!RolesUsuario.Todos.Contains(rol))
        {
            errores["rol"] = "El rol seleccionado no es válido.";
        }

        string? errorContrasena = ContrasenaValidator.Validar(dto.Contrasena);
        if (errorContrasena != null)
        {
            errores["contrasena"] = errorContrasena;
        }

        return errores;
    }
}
