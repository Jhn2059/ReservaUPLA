using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.Validators;

// Validaciones del registro de reservas (RF-03).
// Aquí se aplican RN-02, RN-03 y RN-04 (y una regla adicional: no reservar en fechas pasadas).
public static class ReservaValidator
{
    // Valida ambiente, fecha y horario (se usa también para consultar disponibilidad).
    public static Dictionary<string, string> ValidarHorario(
        Guid? ambienteId, string? fecha, string? horaInicio, string? horaFin)
    {
        var errores = new Dictionary<string, string>();

        // RN-02: todos los datos son obligatorios.
        if (ambienteId == null)
        {
            errores["ambienteId"] = "Debe seleccionar un ambiente.";
        }

        DateOnly? fechaConvertida = null;
        if ((fecha ?? "").Trim() == "")
        {
            errores["fecha"] = "La fecha es obligatoria.";
        }
        else
        {
            fechaConvertida = ConversorFechasHoras.ConvertirFecha(fecha);
            if (fechaConvertida == null)
            {
                errores["fecha"] = "La fecha no tiene un formato válido (aaaa-mm-dd).";
            }
            else if (fechaConvertida.Value < DateOnly.FromDateTime(DateTime.Today))
            {
                errores["fecha"] = "La fecha no puede ser anterior a hoy.";
            }
        }

        TimeOnly? inicio = null;
        if ((horaInicio ?? "").Trim() == "")
        {
            errores["horaInicio"] = "La hora de inicio es obligatoria.";
        }
        else
        {
            inicio = ConversorFechasHoras.ConvertirHora(horaInicio);
            if (inicio == null)
            {
                errores["horaInicio"] = "La hora de inicio no tiene un formato válido (hh:mm).";
            }
        }

        TimeOnly? fin = null;
        if ((horaFin ?? "").Trim() == "")
        {
            errores["horaFin"] = "La hora de fin es obligatoria.";
        }
        else
        {
            fin = ConversorFechasHoras.ConvertirHora(horaFin);
            if (fin == null)
            {
                errores["horaFin"] = "La hora de fin no tiene un formato válido (hh:mm).";
            }
        }

        // RN-04: horario permitido de 07:00 a 22:00.
        if (inicio != null && inicio.Value < HorarioReservas.HoraApertura)
        {
            errores["horaInicio"] = "La hora de inicio no puede ser antes de las 07:00.";
        }
        if (fin != null && fin.Value > HorarioReservas.HoraCierre)
        {
            errores["horaFin"] = "La hora de fin no puede ser después de las 22:00.";
        }

        // RN-03: la hora de fin debe ser mayor que la hora de inicio.
        if (inicio != null && fin != null && fin.Value <= inicio.Value)
        {
            errores["horaFin"] = "La hora de fin debe ser mayor que la hora de inicio.";
        }

        return errores;
    }

    // Valida todos los datos de una reserva (horario + motivo).
    public static Dictionary<string, string> Validar(
        Guid? ambienteId, string? fecha, string? horaInicio, string? horaFin, string? motivo)
    {
        var errores = ValidarHorario(ambienteId, fecha, horaInicio, horaFin);

        string motivoLimpio = (motivo ?? "").Trim();
        if (motivoLimpio == "")
        {
            errores["motivo"] = "El motivo de la reserva es obligatorio.";
        }
        else if (motivoLimpio.Length > 500)
        {
            errores["motivo"] = "El motivo no puede superar los 500 caracteres.";
        }

        return errores;
    }
}
