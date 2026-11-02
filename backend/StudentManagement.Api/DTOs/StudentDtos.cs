using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.DTOs;

public class StudentDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Department { get; set; } = string.Empty;
    public DateTime? EnrollmentDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateStudentDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
    [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Please provide a valid phone number format.")]
    [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Department is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department must be between 2 and 100 characters.")]
    public string Department { get; set; } = string.Empty;

    public DateTime? EnrollmentDate { get; set; }
}

public class UpdateStudentDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please provide a valid email address.")]
    [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Please provide a valid phone number format.")]
    [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Department is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department must be between 2 and 100 characters.")]
    public string Department { get; set; } = string.Empty;

    public DateTime? EnrollmentDate { get; set; }
}

public class StudentStatsDto
{
    public int TotalStudents { get; set; }
    public int TotalDepartments { get; set; }
    public List<DepartmentDistributionDto> Departments { get; set; } = new();
    public List<StudentDto> RecentStudents { get; set; } = new();
}

public class DepartmentDistributionDto
{
    public string Department { get; set; } = string.Empty;
    public int Count { get; set; }
}
