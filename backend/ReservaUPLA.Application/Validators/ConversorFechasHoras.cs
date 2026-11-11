using System.Globalization;

namespace ReservaUPLA.Application.Validators;

// Convierte los textos que llegan del frontend a fecha y hora.
// Devuelve null cuando el texto no tiene el formato esperado.
public static class ConversorFechasHoras
{
    public static DateOnly? ConvertirFecha(string? texto)
    {
        DateOnly fecha;
        bool esValida = DateOnly.TryParseExact(
            (texto ?? "").Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fecha);

        if (esValida)
        {
            return fecha;
        }
        return null;
    }

    public static TimeOnly? ConvertirHora(string? texto)
    {
        TimeOnly hora;
        string[] formatos = { "HH:mm", "HH:mm:ss" };
        bool esValida = TimeOnly.TryParseExact(
            (texto ?? "").Trim(), formatos, CultureInfo.InvariantCulture, DateTimeStyles.None, out hora);

        if (esValida)
        {
            return hora;
        }
        return null;
    }
}
