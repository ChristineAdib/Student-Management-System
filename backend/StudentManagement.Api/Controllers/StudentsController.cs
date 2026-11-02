using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Data;
using StudentManagement.Api.DTOs;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly StudentDbContext _context;
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(StudentDbContext context, ILogger<StudentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all students, with optional search and department filtering.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<StudentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<StudentDto>>> GetAll([FromQuery] string? search = null, [FromQuery] string? department = null)
    {
        var query = _context.Students.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmedSearch = search.Trim().ToLower();
            query = query.Where(s => s.FullName.ToLower().Contains(trimmedSearch) ||
                                     s.Email.ToLower().Contains(trimmedSearch) ||
                                     (s.PhoneNumber != null && s.PhoneNumber.Contains(trimmedSearch)));
        }

        if (!string.IsNullOrWhiteSpace(department) && department != "All")
        {
            var trimmedDept = department.Trim();
            query = query.Where(s => s.Department == trimmedDept);
        }

        var students = await query
            .OrderByDescending(s => s.Id)
            .Select(s => ToDto(s))
            .ToListAsync();

        return Ok(students);
    }

    /// <summary>
    /// Retrieves a single student by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StudentDto>> GetById(int id)
    {
        var student = await _context.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (student == null)
        {
            return NotFound(new { message = $"Student with ID {id} was not found." });
        }

        return Ok(ToDto(student));
    }

    /// <summary>
    /// Creates a new student record.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<StudentDto>> Create([FromBody] CreateStudentDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var normalizedEmail = dto.Email.Trim().ToLower();
        var emailExists = await _context.Students.AnyAsync(s => s.Email.ToLower() == normalizedEmail);
        if (emailExists)
        {
            return Conflict(new { message = $"A student with email '{dto.Email}' already exists." });
        }

        var student = new Student
        {
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim(),
            Department = dto.Department.Trim(),
            EnrollmentDate = dto.EnrollmentDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created new student {Id}: {FullName}", student.Id, student.FullName);

        var responseDto = ToDto(student);
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, responseDto);
    }

    /// <summary>
    /// Updates an existing student record.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<StudentDto>> Update(int id, [FromBody] UpdateStudentDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var student = await _context.Students.FindAsync(id);
        if (student == null)
        {
            return NotFound(new { message = $"Student with ID {id} was not found." });
        }

        var normalizedEmail = dto.Email.Trim().ToLower();
        var emailInUseByOther = await _context.Students.AnyAsync(s => s.Id != id && s.Email.ToLower() == normalizedEmail);
        if (emailInUseByOther)
        {
            return Conflict(new { message = $"Email '{dto.Email}' is already registered to another student." });
        }

        student.FullName = dto.FullName.Trim();
        student.Email = normalizedEmail;
        student.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim();
        student.Department = dto.Department.Trim();
        student.EnrollmentDate = dto.EnrollmentDate;
        student.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated student {Id}: {FullName}", student.Id, student.FullName);

        return Ok(ToDto(student));
    }

    /// <summary>
    /// Deletes a student record.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
        {
            return NotFound(new { message = $"Student with ID {id} was not found." });
        }

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted student {Id}: {FullName}", id, student.FullName);

        return NoContent();
    }

    /// <summary>
    /// Returns database-backed aggregated statistics for the dashboard overview.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(StudentStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<StudentStatsDto>> GetStats()
    {
        var totalStudents = await _context.Students.CountAsync();
        
        var deptGroups = await _context.Students
            .AsNoTracking()
            .GroupBy(s => s.Department)
            .Select(g => new DepartmentDistributionDto
            {
                Department = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(d => d.Count)
            .ToListAsync();

        var recentStudents = await _context.Students
            .AsNoTracking()
            .OrderByDescending(s => s.Id)
            .Take(5)
            .Select(s => ToDto(s))
            .ToListAsync();

        var stats = new StudentStatsDto
        {
            TotalStudents = totalStudents,
            TotalDepartments = deptGroups.Count,
            Departments = deptGroups,
            RecentStudents = recentStudents
        };

        return Ok(stats);
    }

    private static StudentDto ToDto(Student student) => new()
    {
        Id = student.Id,
        FullName = student.FullName,
        Email = student.Email,
        PhoneNumber = student.PhoneNumber,
        Department = student.Department,
        EnrollmentDate = student.EnrollmentDate,
        CreatedAt = student.CreatedAt,
        UpdatedAt = student.UpdatedAt
    };
}
