using System.Text.RegularExpressions;
using ReservaUPLA.Application.DTOs;

namespace ReservaUPLA.Application.Validators;

// Validaciones del formulario de inicio de sesión.
public static class LoginValidator
{
    private const string ExpresionCorreo = @"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$";

    public static Dictionary<string, string> Validar(LoginDto dto)
    {
        var errores = new Dictionary<string, string>();
        string correo = (dto.Correo ?? "").Trim();

        if (correo == "")
        {
            errores["correo"] = "Escriba su correo institucional.";
        }
        else if (!Regex.IsMatch(correo, ExpresionCorreo))
        {
            errores["correo"] = "El correo no tiene un formato válido. Ejemplo: nombre.apellido@upla.edu.pe";
        }

        if (string.IsNullOrEmpty(dto.Contrasena))
        {
            errores["contrasena"] = "Escriba su contraseña.";
        }

        return errores;
    }
}
