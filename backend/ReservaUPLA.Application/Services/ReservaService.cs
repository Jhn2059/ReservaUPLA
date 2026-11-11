using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Exceptions;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.Validators;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Services;

// Casos de uso de reservas: registrar, consultar, modificar y cambiar de estado.
// Aquí viven las reglas de negocio RN-01, RN-05 y RN-06 y el alcance de cada rol.
public class ReservaService : IReservaService
{
    private readonly IReservaRepository _reservas;
    private readonly IUsuarioRepository _usuarios;
    private readonly IAmbienteRepository _ambientes;

    public ReservaService(IReservaRepository reservas, IUsuarioRepository usuarios, IAmbienteRepository ambientes)
    {
        _reservas = reservas;
        _usuarios = usuarios;
        _ambientes = ambientes;
    }

    // RF-03 y RF-04: registrar una solicitud validando antes la disponibilidad.
    // El solicitante es siempre el usuario que inició sesión.
    public ReservaDto Crear(ReservaCrearDto dto, UsuarioActual actor)
    {
        var errores = ReservaValidator.Validar(dto.AmbienteId, dto.Fecha, dto.HoraInicio, dto.HoraFin, dto.Motivo);
        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        Usuario? solicitante = _usuarios.ObtenerPorId(actor.Id);
        if (solicitante == null || !solicitante.Activo)
        {
            throw new NoAutorizadoException("Su usuario no existe o está inactivo y no puede registrar reservas.");
        }

        Ambiente ambiente = ObtenerAmbienteReservable(dto.AmbienteId!.Value);

        DateOnly fecha = ConversorFechasHoras.ConvertirFecha(dto.Fecha)!.Value;
        TimeOnly horaInicio = ConversorFechasHoras.ConvertirHora(dto.HoraInicio)!.Value;
        TimeOnly horaFin = ConversorFechasHoras.ConvertirHora(dto.HoraFin)!.Value;

        // RF-04 / RN-01: no se registra si el horario ya está ocupado por una reserva aprobada.
        Reserva? conflicto = BuscarConflicto(ambiente.Id, fecha, horaInicio, horaFin, null);
        if (conflicto != null)
        {
            throw new ConflictoException(CrearMensajeConflicto(conflicto));
        }

        var reserva = new Reserva();
        reserva.Id = Guid.NewGuid();
        reserva.Fecha = fecha;
        reserva.HoraInicio = horaInicio;
        reserva.HoraFin = horaFin;
        reserva.Motivo = dto.Motivo!.Trim();
        reserva.Estado = EstadosReserva.Pendiente;
        reserva.FechaRegistro = DateTime.UtcNow;
        reserva.UsuarioId = solicitante.Id;
        reserva.AmbienteId = ambiente.Id;

        _reservas.Agregar(reserva);

        return ConvertirADto(_reservas.ObtenerPorId(reserva.Id)!);
    }

    // RF-04: consultar si un ambiente está libre en una fecha y horario.
    public DisponibilidadDto VerificarDisponibilidad(Guid? ambienteId, string? fecha, string? horaInicio, string? horaFin)
    {
        var errores = ReservaValidator.ValidarHorario(ambienteId, fecha, horaInicio, horaFin);
        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        var resultado = new DisponibilidadDto();

        Ambiente? ambiente = _ambientes.ObtenerPorId(ambienteId!.Value);
        if (ambiente == null)
        {
            throw new NoEncontradoException("El ambiente indicado no existe.");
        }
        if (ambiente.Estado != EstadosAmbiente.Disponible)
        {
            resultado.Disponible = false;
            resultado.Mensaje = "El ambiente está en " + ambiente.Estado.ToLower() + " y no se puede reservar.";
            return resultado;
        }

        DateOnly fechaConvertida = ConversorFechasHoras.ConvertirFecha(fecha)!.Value;
        TimeOnly inicio = ConversorFechasHoras.ConvertirHora(horaInicio)!.Value;
        TimeOnly fin = ConversorFechasHoras.ConvertirHora(horaFin)!.Value;

        Reserva? conflicto = BuscarConflicto(ambiente.Id, fechaConvertida, inicio, fin, null);
        if (conflicto != null)
        {
            resultado.Disponible = false;
            resultado.Mensaje = CrearMensajeConflicto(conflicto);
            return resultado;
        }

        resultado.Disponible = true;
        resultado.Mensaje = "El ambiente está disponible en ese horario.";
        return resultado;
    }

    // Franjas del día en las que el ambiente ya tiene reservas aprobadas (para mostrar la línea de tiempo).
    public List<FranjaOcupadaDto> ObtenerFranjasOcupadas(Guid? ambienteId, string? fecha)
    {
        var errores = new Dictionary<string, string>();
        if (ambienteId == null)
        {
            errores["ambienteId"] = "Debe seleccionar un ambiente.";
        }
        DateOnly? fechaConvertida = ConversorFechasHoras.ConvertirFecha(fecha);
        if (fechaConvertida == null)
        {
            errores["fecha"] = "La fecha no tiene un formato válido (aaaa-mm-dd).";
        }
        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        var resultado = new List<FranjaOcupadaDto>();
        foreach (var aprobada in _reservas.ObtenerAprobadasDelAmbiente(ambienteId!.Value, fechaConvertida!.Value).OrderBy(r => r.HoraInicio))
        {
            var franja = new FranjaOcupadaDto();
            franja.HoraInicio = aprobada.HoraInicio.ToString("HH:mm");
            franja.HoraFin = aprobada.HoraFin.ToString("HH:mm");
            resultado.Add(franja);
        }
        return resultado;
    }

    // RF-05: listar reservas. Cada rol solo ve lo que le corresponde:
    //  - Solicitante: sus reservas.
    //  - Responsable de ambiente: las reservas de sus ambientes y las suyas.
    //  - Administrador: todas.
    public List<ReservaDto> Listar(string? estado, Guid? ambienteId, bool soloMias, string? texto, UsuarioActual actor)
    {
        string estadoFiltro = (estado ?? "").Trim();
        if (estadoFiltro != "" && !EstadosReserva.Todos.Contains(estadoFiltro))
        {
            var errores = new Dictionary<string, string>();
            errores["estado"] = "El estado indicado no es válido.";
            throw new ValidacionException(errores);
        }
        string? estadoConsulta = estadoFiltro == "" ? null : estadoFiltro;

        List<Reserva> lista;
        if (actor.Rol == RolesUsuario.Solicitante)
        {
            lista = _reservas.Listar(estadoConsulta, ambienteId, actor.Id, null);
        }
        else if (actor.Rol == RolesUsuario.ResponsableAmbiente && !soloMias)
        {
            lista = _reservas.Listar(estadoConsulta, ambienteId, null, actor.Id);
            foreach (var propia in _reservas.Listar(estadoConsulta, ambienteId, actor.Id, null))
            {
                if (!lista.Any(r => r.Id == propia.Id))
                {
                    lista.Add(propia);
                }
            }
            lista = lista.OrderBy(r => r.Fecha).ThenBy(r => r.HoraInicio).ToList();
        }
        else
        {
            lista = _reservas.Listar(estadoConsulta, ambienteId, soloMias ? actor.Id : null, null);
        }

        // Búsqueda por texto: motivo, ambiente o solicitante.
        string buscado = (texto ?? "").Trim().ToLower();
        if (buscado != "")
        {
            lista = lista.Where(r =>
                r.Motivo.ToLower().Contains(buscado)
                || (r.Ambiente != null && r.Ambiente.Nombre.ToLower().Contains(buscado))
                || (r.Usuario != null && r.Usuario.NombreCompleto.ToLower().Contains(buscado))).ToList();
        }

        var resultado = new List<ReservaDto>();
        foreach (var reserva in lista)
        {
            resultado.Add(ConvertirADto(reserva));
        }
        return resultado;
    }

    // RF-06: detalle de una reserva (solo si el usuario puede verla).
    public ReservaDto ObtenerPorId(Guid id, UsuarioActual actor)
    {
        Reserva reserva = ObtenerReserva(id);

        bool esAdministrador = actor.Rol == RolesUsuario.Administrador;
        bool esDuenio = reserva.UsuarioId == actor.Id;
        bool esResponsableDelAmbiente = reserva.Ambiente != null && reserva.Ambiente.ResponsableId == actor.Id;

        if (!esAdministrador && !esDuenio && !esResponsableDelAmbiente)
        {
            throw new NoAutorizadoException("No tiene permiso para ver esta reserva.");
        }

        return ConvertirADto(reserva);
    }

    // Modificar los datos de una reserva (solo si sigue Pendiente).
    public ReservaDto Actualizar(Guid id, ReservaActualizarDto dto, UsuarioActual actor)
    {
        Reserva reserva = ObtenerReserva(id);

        // RN-06: una reserva rechazada no se puede modificar.
        if (reserva.Estado == EstadosReserva.Rechazada)
        {
            throw new ReglaNegocioException("RN-06: una reserva rechazada no puede modificarse.");
        }
        if (reserva.Estado != EstadosReserva.Pendiente)
        {
            throw new ReglaNegocioException("Solo se pueden modificar las reservas en estado Pendiente.");
        }
        if (actor.Rol != RolesUsuario.Administrador && reserva.UsuarioId != actor.Id)
        {
            throw new NoAutorizadoException("Solo el solicitante o un administrador puede modificar la reserva.");
        }

        var errores = ReservaValidator.Validar(dto.AmbienteId, dto.Fecha, dto.HoraInicio, dto.HoraFin, dto.Motivo);
        if (errores.Count > 0)
        {
            throw new ValidacionException(errores);
        }

        Ambiente ambiente = ObtenerAmbienteReservable(dto.AmbienteId!.Value);
        DateOnly fecha = ConversorFechasHoras.ConvertirFecha(dto.Fecha)!.Value;
        TimeOnly horaInicio = ConversorFechasHoras.ConvertirHora(dto.HoraInicio)!.Value;
        TimeOnly horaFin = ConversorFechasHoras.ConvertirHora(dto.HoraFin)!.Value;

        Reserva? conflicto = BuscarConflicto(ambiente.Id, fecha, horaInicio, horaFin, reserva.Id);
        if (conflicto != null)
        {
            throw new ConflictoException(CrearMensajeConflicto(conflicto));
        }

        reserva.Fecha = fecha;
        reserva.HoraInicio = horaInicio;
        reserva.HoraFin = horaFin;
        reserva.Motivo = dto.Motivo!.Trim();
        reserva.AmbienteId = ambiente.Id;
        reserva.Ambiente = ambiente;

        _reservas.Actualizar(reserva);

        return ConvertirADto(reserva);
    }

    // RF-07: cambiar el estado de una reserva.
    public ReservaDto CambiarEstado(Guid id, string? nuevoEstado, UsuarioActual actor)
    {
        Reserva reserva = ObtenerReserva(id);

        string estado = (nuevoEstado ?? "").Trim();
        if (estado == "" || !EstadosReserva.Todos.Contains(estado))
        {
            var errores = new Dictionary<string, string>();
            errores["estado"] = "El estado debe ser Aprobada, Rechazada o Cancelada.";
            throw new ValidacionException(errores);
        }

        bool esAdministrador = actor.Rol == RolesUsuario.Administrador;

        // RN-05: solo el administrador puede aprobar o rechazar.
        if ((estado == EstadosReserva.Aprobada || estado == EstadosReserva.Rechazada) && !esAdministrador)
        {
            throw new NoAutorizadoException("RN-05: solo el administrador puede aprobar o rechazar reservas.");
        }

        // Cancelar: el administrador o el propio solicitante.
        if (estado == EstadosReserva.Cancelada && !esAdministrador && reserva.UsuarioId != actor.Id)
        {
            throw new NoAutorizadoException("Solo el solicitante o un administrador puede cancelar la reserva.");
        }

        // RN-06: una reserva rechazada no puede modificarse (tampoco su estado).
        if (reserva.Estado == EstadosReserva.Rechazada)
        {
            throw new ReglaNegocioException("RN-06: una reserva rechazada no puede modificarse.");
        }
        if (reserva.Estado == EstadosReserva.Cancelada)
        {
            throw new ReglaNegocioException("Una reserva cancelada no puede cambiar de estado.");
        }
        if (estado == EstadosReserva.Pendiente)
        {
            throw new ReglaNegocioException("Una reserva no puede volver al estado Pendiente.");
        }
        if (reserva.Estado == EstadosReserva.Aprobada && estado != EstadosReserva.Cancelada)
        {
            throw new ReglaNegocioException("Una reserva aprobada solo puede cancelarse.");
        }

        // RN-01: al aprobar, no debe existir otra reserva aprobada en el mismo ambiente, fecha y horario.
        if (estado == EstadosReserva.Aprobada)
        {
            Reserva? conflicto = BuscarConflicto(reserva.AmbienteId, reserva.Fecha, reserva.HoraInicio, reserva.HoraFin, reserva.Id);
            if (conflicto != null)
            {
                throw new ConflictoException("RN-01: no se puede aprobar. " + CrearMensajeConflicto(conflicto));
            }
        }

        reserva.Estado = estado;
        _reservas.Actualizar(reserva);

        return ConvertirADto(reserva);
    }

    // ---------- Métodos auxiliares (privados) ----------

    private Reserva ObtenerReserva(Guid id)
    {
        Reserva? reserva = _reservas.ObtenerPorId(id);
        if (reserva == null)
        {
            throw new NoEncontradoException("La reserva indicada no existe.");
        }
        return reserva;
    }

    private Ambiente ObtenerAmbienteReservable(Guid ambienteId)
    {
        Ambiente? ambiente = _ambientes.ObtenerPorId(ambienteId);
        if (ambiente == null)
        {
            throw new NoEncontradoException("El ambiente indicado no existe.");
        }
        if (ambiente.Estado != EstadosAmbiente.Disponible)
        {
            throw new ReglaNegocioException("El ambiente \"" + ambiente.Nombre + "\" está en " + ambiente.Estado.ToLower() + " y no se puede reservar.");
        }
        return ambiente;
    }

    // Busca una reserva APROBADA del mismo ambiente y fecha cuyo horario se cruce con el indicado.
    // Dos horarios se cruzan cuando: inicio < otroFin  y  fin > otroInicio.
    private Reserva? BuscarConflicto(Guid ambienteId, DateOnly fecha, TimeOnly inicio, TimeOnly fin, Guid? reservaExcluidaId)
    {
        foreach (var aprobada in _reservas.ObtenerAprobadasDelAmbiente(ambienteId, fecha))
        {
            if (reservaExcluidaId != null && aprobada.Id == reservaExcluidaId.Value)
            {
                continue;
            }

            bool seCruzan = inicio < aprobada.HoraFin && fin > aprobada.HoraInicio;
            if (seCruzan)
            {
                return aprobada;
            }
        }
        return null;
    }

    private static string CrearMensajeConflicto(Reserva conflicto)
    {
        return "El ambiente ya tiene una reserva aprobada ese día de "
            + conflicto.HoraInicio.ToString("HH:mm") + " a " + conflicto.HoraFin.ToString("HH:mm") + ".";
    }

    private static ReservaDto ConvertirADto(Reserva reserva)
    {
        var dto = new ReservaDto();
        dto.Id = reserva.Id;
        dto.Fecha = reserva.Fecha.ToString("yyyy-MM-dd");
        dto.HoraInicio = reserva.HoraInicio.ToString("HH:mm");
        dto.HoraFin = reserva.HoraFin.ToString("HH:mm");
        dto.Motivo = reserva.Motivo;
        dto.Estado = reserva.Estado;
        dto.FechaRegistro = reserva.FechaRegistro;
        dto.UsuarioId = reserva.UsuarioId;
        dto.SolicitanteNombre = reserva.Usuario != null ? reserva.Usuario.NombreCompleto : "";
        dto.AmbienteId = reserva.AmbienteId;
        dto.AmbienteNombre = reserva.Ambiente != null ? reserva.Ambiente.Nombre : "";
        return dto;
    }
}
