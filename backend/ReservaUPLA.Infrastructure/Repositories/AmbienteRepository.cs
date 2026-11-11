using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Persistence;

namespace ReservaUPLA.Infrastructure.Repositories;

public class AmbienteRepository : IAmbienteRepository
{
    private readonly ReservaUPLADbContext _contexto;

    public AmbienteRepository(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public void Agregar(Ambiente ambiente)
    {
        _contexto.Ambientes.Add(ambiente);
        _contexto.SaveChanges();
    }

    public Ambiente? ObtenerPorId(Guid id)
    {
        return _contexto.Ambientes.Include(a => a.Responsable).FirstOrDefault(a => a.Id == id);
    }

    public Ambiente? ObtenerPorNombre(string nombre)
    {
        string nombreMinusculas = nombre.ToLower();
        return _contexto.Ambientes.FirstOrDefault(a => a.Nombre.ToLower() == nombreMinusculas);
    }

    public List<Ambiente> ObtenerTodos()
    {
        return _contexto.Ambientes.Include(a => a.Responsable).OrderBy(a => a.Nombre).ToList();
    }
}
