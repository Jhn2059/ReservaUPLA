using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Security;

namespace ReservaUPLA.Infrastructure.Persistence;

// Crea la base de datos (si no existe) y carga datos de ejemplo la primera vez.
public static class SeedData
{
    public const string ContrasenaDemo = "Upla2026!";

    public static void Inicializar(ReservaUPLADbContext contexto)
    {
        // Crea la base de datos y las tablas si aún no existen.
        contexto.Database.EnsureCreated();

        // Si ya hay usuarios, no se vuelve a cargar nada.
        if (contexto.Usuarios.Any())
        {
            return;
        }

        // ---------- Usuarios ----------
        // Todos los usuarios de ejemplo usan la misma contraseña inicial (solo para pruebas).
        string hashInicial = new BcryptPasswordHasher().Hashear(ContrasenaDemo);
        Usuario admin = NuevoUsuario("Rosa Medina Paredes", "rmedina@upla.edu.pe", RolesUsuario.Administrador, hashInicial);
        Usuario respCarlos = NuevoUsuario("Carlos Quispe Rojas", "cquispe@upla.edu.pe", RolesUsuario.ResponsableAmbiente, hashInicial);
        Usuario respLucia = NuevoUsuario("Lucía Ramos Soto", "lramos@upla.edu.pe", RolesUsuario.ResponsableAmbiente, hashInicial);
        Usuario ana = NuevoUsuario("Ana Torres Salas", "atorres@upla.edu.pe", RolesUsuario.Solicitante, hashInicial);
        Usuario luis = NuevoUsuario("Luis Huamán Vega", "lhuaman@upla.edu.pe", RolesUsuario.Solicitante, hashInicial);
        Usuario maria = NuevoUsuario("María Lazo Cruz", "mlazo@upla.edu.pe", RolesUsuario.Solicitante, hashInicial);
        contexto.Usuarios.AddRange(admin, respCarlos, respLucia, ana, luis, maria);

        // ---------- Ambientes ----------
        Ambiente lab1 = NuevoAmbiente("Laboratorio de Cómputo 1", "Laboratorio de cómputo", 30, "Pabellón B - Piso 2", EstadosAmbiente.Disponible, respCarlos);
        Ambiente lab2 = NuevoAmbiente("Laboratorio de Cómputo 2", "Laboratorio de cómputo", 30, "Pabellón B - Piso 2", EstadosAmbiente.Disponible, respCarlos);
        Ambiente auditorio = NuevoAmbiente("Auditorio Central", "Auditorio", 250, "Pabellón A - Piso 1", EstadosAmbiente.Disponible, null);
        Ambiente sala = NuevoAmbiente("Sala de Reuniones 1", "Sala de reuniones", 12, "Edificio administrativo - Piso 3", EstadosAmbiente.Disponible, respLucia);
        Ambiente redes = NuevoAmbiente("Laboratorio de Redes", "Laboratorio especializado", 20, "Pabellón C - Piso 1", EstadosAmbiente.Disponible, respCarlos);
        Ambiente fisica = NuevoAmbiente("Laboratorio de Física", "Laboratorio especializado", 24, "Pabellón C - Piso 2", EstadosAmbiente.Mantenimiento, null);
        contexto.Ambientes.AddRange(lab1, lab2, auditorio, sala, redes, fisica);

        // ---------- Reservas de ejemplo (fechas relativas a hoy) ----------
        // Nota: las reservas aprobadas del mismo ambiente no se cruzan entre sí (RN-01).
        contexto.Reservas.AddRange(
            NuevaReserva(1, "08:00", "10:00", "Clase de Construcción de Software", EstadosReserva.Aprobada, ana, lab1),
            NuevaReserva(1, "10:00", "12:00", "Práctica de programación en C#", EstadosReserva.Pendiente, luis, lab1),
            NuevaReserva(3, "14:00", "16:00", "Taller de bases de datos", EstadosReserva.Aprobada, maria, lab1),
            NuevaReserva(4, "09:00", "11:00", "Seminario de actualización docente", EstadosReserva.Aprobada, admin, lab1),
            NuevaReserva(1, "15:00", "17:00", "Asesoría grupal de proyectos", EstadosReserva.Pendiente, ana, lab2),
            NuevaReserva(2, "08:00", "10:00", "Examen de Ingeniería de Software", EstadosReserva.Aprobada, luis, lab2),
            NuevaReserva(4, "18:00", "20:00", "Reunión de delegados", EstadosReserva.Cancelada, maria, lab2),
            NuevaReserva(2, "14:00", "17:00", "Conferencia de bienvenida a ingresantes", EstadosReserva.Aprobada, ana, auditorio),
            NuevaReserva(3, "08:00", "12:00", "Defensa de tesis de pregrado", EstadosReserva.Pendiente, luis, auditorio),
            NuevaReserva(5, "09:00", "13:00", "Evento externo sin autorización previa", EstadosReserva.Rechazada, maria, auditorio),
            NuevaReserva(1, "11:00", "12:00", "Reunión del comité de calidad", EstadosReserva.Aprobada, admin, sala),
            NuevaReserva(6, "16:00", "18:00", "Reunión de coordinación académica", EstadosReserva.Pendiente, ana, sala),
            NuevaReserva(2, "10:00", "12:00", "Práctica de configuración de routers", EstadosReserva.Pendiente, luis, redes)
        );

        contexto.SaveChanges();
    }

    private static Usuario NuevoUsuario(string nombre, string correo, string rol, string hash)
    {
        var usuario = new Usuario();
        usuario.Id = Guid.NewGuid();
        usuario.NombreCompleto = nombre;
        usuario.Correo = correo;
        usuario.ContrasenaHash = hash;
        usuario.Rol = rol;
        usuario.Activo = true;
        return usuario;
    }

    private static Ambiente NuevoAmbiente(string nombre, string tipo, int capacidad, string ubicacion, string estado, Usuario? responsable)
    {
        var ambiente = new Ambiente();
        ambiente.Id = Guid.NewGuid();
        ambiente.Nombre = nombre;
        ambiente.Tipo = tipo;
        ambiente.Capacidad = capacidad;
        ambiente.Ubicacion = ubicacion;
        ambiente.Estado = estado;
        ambiente.ResponsableId = responsable != null ? responsable.Id : null;
        return ambiente;
    }

    private static Reserva NuevaReserva(int diasDesdeHoy, string inicio, string fin, string motivo, string estado, Usuario solicitante, Ambiente ambiente)
    {
        var reserva = new Reserva();
        reserva.Id = Guid.NewGuid();
        reserva.Fecha = DateOnly.FromDateTime(DateTime.Today.AddDays(diasDesdeHoy));
        reserva.HoraInicio = TimeOnly.Parse(inicio);
        reserva.HoraFin = TimeOnly.Parse(fin);
        reserva.Motivo = motivo;
        reserva.Estado = estado;
        reserva.FechaRegistro = DateTime.UtcNow;
        reserva.UsuarioId = solicitante.Id;
        reserva.AmbienteId = ambiente.Id;
        return reserva;
    }
}
