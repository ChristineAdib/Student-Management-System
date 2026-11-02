using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using StudentManagement.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database context
builder.Services.AddDbContext<StudentDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// CORS configuration for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://127.0.0.1:4200",
                "http://localhost:4201"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Student Management System API",
        Version = "v1",
        Description = "RESTful API for Student Management System with Microsoft SQL Server persistence."
    });
});

var app = builder.Build();

// Migrate and seed database automatically at startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = services.GetRequiredService<StudentDbContext>();
        logger.LogInformation("Applying database migrations...");
        db.Database.Migrate();
        logger.LogInformation("Database migrated successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// Configure HTTP request pipeline.
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student Management API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularDev");

app.UseAuthorization();

app.MapControllers();

app.Run();
