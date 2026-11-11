using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Persistence;

namespace ReservaUPLA.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly ReservaUPLADbContext _contexto;

    public UsuarioRepository(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public void Agregar(Usuario usuario)
    {
        _contexto.Usuarios.Add(usuario);
        _contexto.SaveChanges();
    }

    public Usuario? ObtenerPorId(Guid id)
    {
        return _contexto.Usuarios.FirstOrDefault(u => u.Id == id);
    }

    public Usuario? ObtenerPorCorreo(string correo)
    {
        return _contexto.Usuarios.FirstOrDefault(u => u.Correo == correo);
    }

    public List<Usuario> ObtenerTodos()
    {
        return _contexto.Usuarios.OrderBy(u => u.NombreCompleto).ToList();
    }
}
