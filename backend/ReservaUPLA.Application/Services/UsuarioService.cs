using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Exceptions;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;

    public UsuarioService(IUsuarioRepository usuarios, IPasswordHasher hasher)
    {
        _usuarios = usuarios;
        _hasher = hasher;
    }

    // RF-01: registrar usuarios.
    public UsuarioDto Crear(UsuarioCrearDto dto)
    {
        var errores = UsuarioValidator.Validar(dto);
        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        string correo = dto.Correo!.Trim().ToLower();

        // El correo no puede repetirse.
        if (_usuarios.ObtenerPorCorreo(correo) != null)
        {
            var errorCorreo = new Dictionary<string, string>();
            errorCorreo["correo"] = "Ya existe un usuario registrado con ese correo.";
            throw new ValidacionException(errorCorreo);
        }

        var usuario = new Usuario();
        usuario.Id = Guid.NewGuid();
        usuario.NombreCompleto = dto.NombreCompleto!.Trim();
        usuario.Correo = correo;
        usuario.ContrasenaHash = _hasher.Hashear(dto.Contrasena!);
        usuario.Rol = dto.Rol!.Trim();
        usuario.Activo = true;

        _usuarios.Agregar(usuario);

        return ConvertirADto(usuario);
    }

    public List<UsuarioDto> Listar()
    {
        var resultado = new List<UsuarioDto>();
        foreach (var usuario in _usuarios.ObtenerTodos())
        {
            resultado.Add(ConvertirADto(usuario));
        }
        return resultado;
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
