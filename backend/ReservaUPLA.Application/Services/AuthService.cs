using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Exceptions;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

// Inicio de sesión. Aplica estas medidas de seguridad:
//  - Mensaje único ante cualquier fallo (no revela si el correo existe).
//  - Tiempo de respuesta similar exista o no el correo.
//  - Bloqueo temporal tras varios intentos fallidos.
public class AuthService : IAuthService
{
    private const string MensajeCredencialesInvalidas =
        "El correo o la contraseña no son válidos. Verifíquelos e intente de nuevo.";

    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;
    private readonly ILoginAttemptTracker _intentos;

    public AuthService(IUsuarioRepository usuarios, IPasswordHasher hasher, ITokenService tokens, ILoginAttemptTracker intentos)
    {
        _usuarios = usuarios;
        _hasher = hasher;
        _tokens = tokens;
        _intentos = intentos;
    }

    public SesionDto IniciarSesion(LoginDto dto)
    {
        var errores = LoginValidator.Validar(dto);
        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        string correo = dto.Correo!.Trim().ToLower();
        string contrasena = dto.Contrasena!;

        int minutos;
        if (_intentos.EstaBloqueado(correo, out minutos))
        {
            throw new DemasiadosIntentosException(
                "Se superó el número de intentos permitidos. Intente nuevamente en " + minutos + " minuto(s).");
        }

        Usuario? usuario = _usuarios.ObtenerPorCorreo(correo);

        bool credencialesCorrectas;
        if (usuario == null)
        {
            _hasher.SimularVerificacion(contrasena);
            credencialesCorrectas = false;
        }
        else
        {
            credencialesCorrectas = _hasher.Verificar(contrasena, usuario.ContrasenaHash) && usuario.Activo;
        }

        if (!credencialesCorrectas)
        {
            _intentos.RegistrarFallo(correo);
            throw new NoAutenticadoException(MensajeCredencialesInvalidas);
        }

        _intentos.Reiniciar(correo);

        DateTime expiraEn;
        string token = _tokens.GenerarToken(usuario!, out expiraEn);

        var sesion = new SesionDto();
        sesion.Token = token;
        sesion.ExpiraEn = expiraEn;
        sesion.Usuario = ConvertirADto(usuario!);
        return sesion;
    }

    public UsuarioDto ObtenerUsuario(Guid usuarioId)
    {
        Usuario? usuario = _usuarios.ObtenerPorId(usuarioId);
        if (usuario == null || !usuario.Activo)
        {
            throw new NoAutenticadoException("La sesión ya no es válida. Inicie sesión nuevamente.");
        }
        return ConvertirADto(usuario);
    }

    private static UsuarioDto ConvertirADto(Usuario usuario)
    {
        var dto = new UsuarioDto();
        dto.Id = usuario.Id;
        dto.NombreCompleto = usuario.NombreCompleto;
        dto.Correo = usuario.Correo;
        dto.Rol = usuario.Rol;
        dto.Activo = usuario.Activo;
        return dto;
    }
}
