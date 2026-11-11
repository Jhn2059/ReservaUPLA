using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ReservaUPLA.API.Middleware;
using ReservaUPLA.API.Security;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.Services;
using ReservaUPLA.Infrastructure.Persistence;
using ReservaUPLA.Infrastructure.Repositories;
using ReservaUPLA.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger con botón "Authorize" para probar los endpoints protegidos.
builder.Services.AddSwaggerGen(opciones =>
{
    opciones.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Escriba solo el token que devuelve POST /api/auth/login."
    });
    opciones.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] { }
        }
    });
});

// Conexión a PostgreSQL (la cadena está en appsettings.json).
builder.Services.AddDbContext<ReservaUPLADbContext>(opciones =>
    opciones.UseNpgsql(builder.Configuration.GetConnectionString("ReservaUPLA")));

// Seguridad: token de acceso, cifrado de contraseñas y control de intentos.
var opcionesJwt = new JwtOpciones();
builder.Configuration.GetSection("Jwt").Bind(opcionesJwt);
builder.Services.AddSingleton(opcionesJwt);
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
builder.Services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddSingleton<ILoginAttemptTracker, LoginAttemptTracker>();

builder.Services.AddAuthentication(JwtAuthenticationHandler.Esquema)
    .AddScheme<AuthenticationSchemeOptions, JwtAuthenticationHandler>(JwtAuthenticationHandler.Esquema, null);
builder.Services.AddAuthorization();

// Inversión de dependencias: cada interfaz se conecta con su implementación.
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAmbienteRepository, AmbienteRepository>();
builder.Services.AddScoped<IReservaRepository, ReservaRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAmbienteService, AmbienteService>();
builder.Services.AddScoped<IReservaService, ReservaService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// CORS: permite que el frontend (otro puerto) consuma la API.
builder.Services.AddCors(opciones =>
{
    opciones.AddPolicy("PermitirFrontend", politica =>
    {
        politica
            .SetIsOriginAllowed(origen =>
            {
                Uri? direccion;
                if (!Uri.TryCreate(origen, UriKind.Absolute, out direccion))
                {
                    return false;
                }
                return direccion.Host == "localhost" || direccion.Host == "127.0.0.1";
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Crea la base de datos y carga los datos de ejemplo la primera vez.
using (var alcance = app.Services.CreateScope())
{
    try
    {
        var contexto = alcance.ServiceProvider.GetRequiredService<ReservaUPLADbContext>();
        SeedData.Inicializar(contexto);
    }
    catch (Exception ex)
    {
        Console.WriteLine("No se pudo preparar la base de datos. Verifique que PostgreSQL esté en ejecución");
        Console.WriteLine("y que la cadena de conexión de appsettings.json sea correcta.");
        Console.WriteLine("Si ya había ejecutado una versión anterior, elimine la base: dropdb -U postgres reservaupla");
        Console.WriteLine("Detalle: " + ex.Message);
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ManejadorExcepcionesMiddleware>();
app.UseCors("PermitirFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
