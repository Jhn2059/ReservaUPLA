using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces;

// Contratos de acceso a datos. Los implementa la capa Infrastructure.

public interface IUsuarioRepository
{
    void Agregar(Usuario usuario);
    Usuario? ObtenerPorId(Guid id);
    Usuario? ObtenerPorCorreo(string correo);
    List<Usuario> ObtenerTodos();
}

public interface IAmbienteRepository
{
    void Agregar(Ambiente ambiente);
    Ambiente? ObtenerPorId(Guid id);
    Ambiente? ObtenerPorNombre(string nombre);
    List<Ambiente> ObtenerTodos();
}

public interface IReservaRepository
{
    void Agregar(Reserva reserva);
    void Actualizar(Reserva reserva);
    Reserva? ObtenerPorId(Guid id);

    // usuarioId: solo reservas de ese solicitante.
    // responsableId: solo reservas de ambientes que tiene asignados ese responsable.
    List<Reserva> Listar(string? estado, Guid? ambienteId, Guid? usuarioId, Guid? responsableId);

    List<Reserva> ObtenerAprobadasDelAmbiente(Guid ambienteId, DateOnly fecha);
}
