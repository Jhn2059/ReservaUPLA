using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.Infrastructure.Security;

// Cifrado de contraseñas con BCrypt (algoritmo lento a propósito, con "salt" aleatorio).
public class BcryptPasswordHasher : IPasswordHasher
{
    // Hash de una contraseña inventada, usado para igualar tiempos cuando el usuario no existe.
    private static readonly string HashFicticio = BCrypt.Net.BCrypt.HashPassword("contrasena-ficticia-para-igualar-tiempos");

    public string Hashear(string contrasena)
    {
        return BCrypt.Net.BCrypt.HashPassword(contrasena);
    }

    public bool Verificar(string contrasena, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(contrasena, hash);
    }

    public void SimularVerificacion(string contrasena)
    {
        BCrypt.Net.BCrypt.Verify(contrasena, HashFicticio);
    }
}
