namespace ReservaUPLA.Application.Validators;

// Reglas de una contraseña segura. Devuelve null si es válida o el mensaje a mostrar.
public static class ContrasenaValidator
{
    public static string? Validar(string? contrasena)
    {
        string texto = contrasena ?? "";

        if (texto == "")
        {
            return "La contraseña es obligatoria.";
        }
        if (texto.Length < 8)
        {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (texto.Length > 64)
        {
            return "La contraseña no puede superar los 64 caracteres.";
        }
        if (!texto.Any(char.IsUpper) || !texto.Any(char.IsLower) || !texto.Any(char.IsDigit))
        {
            return "La contraseña debe incluir una mayúscula, una minúscula y un número.";
        }
        return null;
    }
}
