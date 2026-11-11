using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Exceptions;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

public class AmbienteService : IAmbienteService
{
    private readonly IAmbienteRepository _ambientes;
    private readonly IUsuarioRepository _usuarios;

    public AmbienteService(IAmbienteRepository ambientes, IUsuarioRepository usuarios)
    {
        _ambientes = ambientes;
        _usuarios = usuarios;
    }

    // RF-02: registrar ambientes universitarios.
    public AmbienteDto Crear(AmbienteCrearDto dto)
    {
        var errores = AmbienteValidator.Validar(dto);

        string nombre = (dto.Nombre ?? "").Trim();
        if (!errores.ContainsKey("nombre") && _ambientes.ObtenerPorNombre(nombre) != null)
        {
            errores["nombre"] = "Ya existe un ambiente con ese nombre.";
        }

        // El responsable es opcional, pero si se indica debe existir y tener el rol correcto.
        if (dto.ResponsableId != null)
        {
            Usuario? responsable = _usuarios.ObtenerPorId(dto.ResponsableId.Value);
            if (responsable == null || responsable.Rol != RolesUsuario.ResponsableAmbiente)
            {
                errores["responsableId"] = "El responsable debe ser un usuario con rol Responsable de ambiente.";
            }
        }

        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        var ambiente = new Ambiente();
        ambiente.Id = Guid.NewGuid();
        ambiente.Nombre = nombre;
        ambiente.Tipo = dto.Tipo!.Trim();
        ambiente.Capacidad = dto.Capacidad!.Value;
        ambiente.Ubicacion = dto.Ubicacion!.Trim();
        ambiente.Estado = string.IsNullOrWhiteSpace(dto.Estado) ? EstadosAmbiente.Disponible : dto.Estado.Trim();
        ambiente.ResponsableId = dto.ResponsableId;

        _ambientes.Agregar(ambiente);

        // Se vuelve a leer para traer el nombre del responsable.
        return ConvertirADto(_ambientes.ObtenerPorId(ambiente.Id)!);
    }

    public List<AmbienteDto> Listar()
    {
        var resultado = new List<AmbienteDto>();
        foreach (var ambiente in _ambientes.ObtenerTodos())
        {
            resultado.Add(ConvertirADto(ambiente));
        }
        return resultado;
    }

    private static AmbienteDto ConvertirADto(Ambiente ambiente)
    {
        var dto = new AmbienteDto();
        dto.Id = ambiente.Id;
        dto.Nombre = ambiente.Nombre;
        dto.Tipo = ambiente.Tipo;
        dto.Capacidad = ambiente.Capacidad;
        dto.Ubicacion = ambiente.Ubicacion;
        dto.Estado = ambiente.Estado;
        dto.ResponsableId = ambiente.ResponsableId;
        dto.ResponsableNombre = ambiente.Responsable != null ? ambiente.Responsable.NombreCompleto : "";
        return dto;
    }
}
