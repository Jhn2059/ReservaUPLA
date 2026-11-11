namespace ReservaUPLA.Application.Exceptions;

// Se lanza cuando los datos enviados no cumplen las reglas de validación (HTTP 400).
public class ValidacionException : Exception
{
    public Dictionary<string, string> Errores { get; }

    public ValidacionException(Dictionary<string, string> errores)
        : base("Hay datos que deben corregirse.")
    {
        Errores = errores;
    }
}
