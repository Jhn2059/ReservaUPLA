using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Persistence;

namespace ReservaUPLA.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly ReservaUPLADbContext _contexto;

    public ReservaRepository(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public void Agregar(Reserva reserva)
    {
        _contexto.Reservas.Add(reserva);
        _contexto.SaveChanges();
    }

    // Las entidades consultadas ya están "seguidas" por el contexto,
    // por eso basta con guardar los cambios.
    public void Actualizar(Reserva reserva)
    {
        _contexto.SaveChanges();
    }

    public Reserva? ObtenerPorId(Guid id)
    {
        return _contexto.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .FirstOrDefault(r => r.Id == id);
    }

    public List<Reserva> Listar(string? estado, Guid? ambienteId, Guid? usuarioId, Guid? responsableId)
    {
        IQueryable<Reserva> consulta = _contexto.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente);

        if (estado != null)
        {
            consulta = consulta.Where(r => r.Estado == estado);
        }
        if (ambienteId != null)
        {
            consulta = consulta.Where(r => r.AmbienteId == ambienteId.Value);
        }
        if (usuarioId != null)
        {
            consulta = consulta.Where(r => r.UsuarioId == usuarioId.Value);
        }

        if (responsableId != null)
        {
            consulta = consulta.Where(r => r.Ambiente!.ResponsableId == responsableId.Value);
        }

        return consulta.OrderBy(r => r.Fecha).ThenBy(r => r.HoraInicio).ToList();
    }

    public List<Reserva> ObtenerAprobadasDelAmbiente(Guid ambienteId, DateOnly fecha)
    {
        return _contexto.Reservas
            .Where(r => r.AmbienteId == ambienteId && r.Fecha == fecha && r.Estado == EstadosReserva.Aprobada)
            .ToList();
    }
}
