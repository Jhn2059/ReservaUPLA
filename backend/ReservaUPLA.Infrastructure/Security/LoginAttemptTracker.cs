using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.Infrastructure.Security;

// Lleva la cuenta de intentos fallidos de inicio de sesión (en memoria).
// Tras 5 fallos seguidos, el correo queda bloqueado 5 minutos.
public class LoginAttemptTracker : ILoginAttemptTracker
{
    private const int MaximoFallos = 5;
    private const int MinutosBloqueo = 5;

    private class Registro
    {
        public int Fallos;
        public DateTime? BloqueadoHasta;
    }

    private readonly Dictionary<string, Registro> _registros = new Dictionary<string, Registro>();
    private readonly object _candado = new object();

    public bool EstaBloqueado(string correo, out int minutosRestantes)
    {
        lock (_candado)
        {
            minutosRestantes = 0;
            if (!_registros.ContainsKey(correo) || _registros[correo].BloqueadoHasta == null)
            {
                return false;
            }

            DateTime hasta = _registros[correo].BloqueadoHasta!.Value;
            if (DateTime.UtcNow >= hasta)
            {
                _registros.Remove(correo);
                return false;
            }

            minutosRestantes = (int)Math.Ceiling((hasta - DateTime.UtcNow).TotalMinutes);
            return true;
        }
    }

    public void RegistrarFallo(string correo)
    {
        lock (_candado)
        {
            if (!_registros.ContainsKey(correo))
            {
                _registros[correo] = new Registro();
            }

            Registro registro = _registros[correo];
            registro.Fallos++;
            if (registro.Fallos >= MaximoFallos)
            {
                registro.BloqueadoHasta = DateTime.UtcNow.AddMinutes(MinutosBloqueo);
            }
        }
    }

    public void Reiniciar(string correo)
    {
        lock (_candado)
        {
            _registros.Remove(correo);
        }
    }
}
