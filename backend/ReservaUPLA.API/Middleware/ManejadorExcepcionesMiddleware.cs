using ReservaUPLA.Application.Exceptions;

namespace ReservaUPLA.API.Middleware;

// Captura las excepciones del sistema y las convierte en respuestas HTTP con un mensaje claro.
// Así los controladores no necesitan try/catch y el formato de error es siempre el mismo.
public class ManejadorExcepcionesMiddleware
{
    private readonly RequestDelegate _siguiente;
    private readonly ILogger<ManejadorExcepcionesMiddleware> _registro;

    public ManejadorExcepcionesMiddleware(RequestDelegate siguiente, ILogger<ManejadorExcepcionesMiddleware> registro)
    {
        _siguiente = siguiente;
        _registro = registro;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _siguiente(contexto);
        }
        catch (ValidacionException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status400BadRequest;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message, errores = ex.Errores });
        }
        catch (NoEncontradoException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status404NotFound;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message });
        }
        catch (NoAutenticadoException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message });
        }
        catch (DemasiadosIntentosException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message });
        }
        catch (NoAutorizadoException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status403Forbidden;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message });
        }
        catch (ConflictoException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status409Conflict;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message });
        }
        catch (ReglaNegocioException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            // Error no previsto: se registra y se responde sin mostrar detalles internos.
            _registro.LogError(ex, "Error inesperado al procesar la solicitud.");
            contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await contexto.Response.WriteAsJsonAsync(new { mensaje = "Ocurrió un error inesperado. Intente nuevamente." });
        }
    }
}
