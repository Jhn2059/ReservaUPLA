using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.Validators;

// Validaciones del registro de ambientes (RF-02).
public static class AmbienteValidator
{
    public static Dictionary<string, string> Validar(AmbienteCrearDto dto)
    {
        var errores = new Dictionary<string, string>();

        string nombre = (dto.Nombre ?? "").Trim();
        string tipo = (dto.Tipo ?? "").Trim();
        string ubicacion = (dto.Ubicacion ?? "").Trim();
        string estado = (dto.Estado ?? "").Trim();

        if (nombre == "")
        {
            errores["nombre"] = "El nombre del ambiente es obligatorio.";
        }
        else if (nombre.Length > 100)
        {
            errores["nombre"] = "El nombre no puede superar los 100 caracteres.";
        }

        if (tipo == "")
        {
            errores["tipo"] = "Debe seleccionar el tipo de ambiente.";
        }
        else if (!TiposAmbiente.Todos.Contains(tipo))
        {
            errores["tipo"] = "El tipo de ambiente no es válido.";
        }

        if (dto.Capacidad == null)
        {
            errores["capacidad"] = "La capacidad es obligatoria.";
        }
        else if (dto.Capacidad < 1 || dto.Capacidad > 1000)
        {
            errores["capacidad"] = "La capacidad debe ser un número entre 1 y 1000.";
        }

        if (ubicacion == "")
        {
            errores["ubicacion"] = "La ubicación es obligatoria.";
        }
        else if (ubicacion.Length > 100)
        {
            errores["ubicacion"] = "La ubicación no puede superar los 100 caracteres.";
        }

        // El estado es opcional: si no se envía, el ambiente queda Disponible.
        if (estado != "" && !EstadosAmbiente.Todos.Contains(estado))
        {
            errores["estado"] = "El estado del ambiente no es válido.";
        }

        return errores;
    }
}
