using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces;

// Contratos de seguridad. Los implementa la capa Infrastructure.

public interface IPasswordHasher
{
    string Hashear(string contrasena);
    bool Verificar(string contrasena, string hash);

    // Hace el mismo trabajo que Verificar cuando el usuario no existe, para que
    // la respuesta tarde lo mismo y no se pueda saber qué correos están registrados.
    void SimularVerificacion(string contrasena);
}

public interface ITokenService
{
    string GenerarToken(Usuario usuario, out DateTime expiraEn);
    UsuarioToken? ValidarToken(string token);
}

// Cuenta los intentos fallidos de inicio de sesión por correo.
public interface ILoginAttemptTracker
{
    bool EstaBloqueado(string correo, out int minutosRestantes);
    void RegistrarFallo(string correo);
    void Reiniciar(string correo);
}
