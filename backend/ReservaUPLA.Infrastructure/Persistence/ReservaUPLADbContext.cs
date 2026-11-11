using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Persistence;

// Describe cómo se guardan las entidades en PostgreSQL (tablas, columnas y relaciones).
public class ReservaUPLADbContext : DbContext
{
    public ReservaUPLADbContext(DbContextOptions<ReservaUPLADbContext> opciones) : base(opciones)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Ambiente> Ambientes => Set<Ambiente>();
    public DbSet<Reserva> Reservas => Set<Reserva>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        // ---------- Tabla usuarios ----------
        modelo.Entity<Usuario>(entidad =>
        {
            entidad.ToTable("usuarios");
            entidad.HasKey(u => u.Id);
            entidad.Property(u => u.Id).HasColumnName("id").ValueGeneratedNever();
            entidad.Property(u => u.NombreCompleto).HasColumnName("nombre_completo").HasMaxLength(150).IsRequired();
            entidad.Property(u => u.Correo).HasColumnName("correo").HasMaxLength(150).IsRequired();
            entidad.Property(u => u.ContrasenaHash).HasColumnName("contrasena_hash").HasMaxLength(100).IsRequired();
            entidad.Property(u => u.Rol).HasColumnName("rol").HasMaxLength(50).IsRequired();
            entidad.Property(u => u.Activo).HasColumnName("activo").IsRequired();
            entidad.HasIndex(u => u.Correo).IsUnique();
        });

        // ---------- Tabla ambientes ----------
        modelo.Entity<Ambiente>(entidad =>
        {
            entidad.ToTable("ambientes");
            entidad.HasKey(a => a.Id);
            entidad.Property(a => a.Id).HasColumnName("id").ValueGeneratedNever();
            entidad.Property(a => a.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
            entidad.Property(a => a.Tipo).HasColumnName("tipo").HasMaxLength(50).IsRequired();
            entidad.Property(a => a.Capacidad).HasColumnName("capacidad").IsRequired();
            entidad.Property(a => a.Ubicacion).HasColumnName("ubicacion").HasMaxLength(100).IsRequired();
            entidad.Property(a => a.Estado).HasColumnName("estado").HasMaxLength(30).IsRequired();
            entidad.Property(a => a.ResponsableId).HasColumnName("responsable_id");
            entidad.HasIndex(a => a.Nombre).IsUnique();

            entidad.HasOne(a => a.Responsable)
                .WithMany()
                .HasForeignKey(a => a.ResponsableId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ---------- Tabla reservas ----------
        modelo.Entity<Reserva>(entidad =>
        {
            // RN-03 también se protege en la base de datos con una restricción CHECK.
            entidad.ToTable("reservas", tabla =>
                tabla.HasCheckConstraint("ck_reservas_hora_fin_mayor", "hora_fin > hora_inicio"));

            entidad.HasKey(r => r.Id);
            entidad.Property(r => r.Id).HasColumnName("id").ValueGeneratedNever();
            entidad.Property(r => r.Fecha).HasColumnName("fecha").HasColumnType("date").IsRequired();
            entidad.Property(r => r.HoraInicio).HasColumnName("hora_inicio").HasColumnType("time").IsRequired();
            entidad.Property(r => r.HoraFin).HasColumnName("hora_fin").HasColumnType("time").IsRequired();
            entidad.Property(r => r.Motivo).HasColumnName("motivo").HasColumnType("text").IsRequired();
            entidad.Property(r => r.Estado).HasColumnName("estado").HasMaxLength(30).IsRequired();
            entidad.Property(r => r.FechaRegistro).HasColumnName("fecha_registro").HasColumnType("timestamp with time zone").IsRequired();
            entidad.Property(r => r.UsuarioId).HasColumnName("usuario_id").IsRequired();
            entidad.Property(r => r.AmbienteId).HasColumnName("ambiente_id").IsRequired();

            // Índice para buscar rápido las reservas de un ambiente en una fecha.
            entidad.HasIndex(r => new { r.AmbienteId, r.Fecha });

            entidad.HasOne(r => r.Usuario)
                .WithMany()
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entidad.HasOne(r => r.Ambiente)
                .WithMany()
                .HasForeignKey(r => r.AmbienteId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
