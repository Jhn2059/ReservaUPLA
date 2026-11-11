namespace ReservaUPLA.Domain.Constants;

// RN-04: las reservas solo se pueden hacer entre las 07:00 y las 22:00.
public static class HorarioReservas
{
    public static readonly TimeOnly HoraApertura = new TimeOnly(7, 0);
    public static readonly TimeOnly HoraCierre = new TimeOnly(22, 0);
}
