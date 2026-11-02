using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Data;

public class StudentDbContext : DbContext
{
    public StudentDbContext(DbContextOptions<StudentDbContext> options) : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.Property(s => s.FullName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(s => s.Email)
                .IsRequired()
                .HasMaxLength(150);

            entity.HasIndex(s => s.Email)
                .IsUnique();

            entity.Property(s => s.PhoneNumber)
                .HasMaxLength(20);

            entity.Property(s => s.Department)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(s => s.EnrollmentDate)
                .HasColumnType("date");

            entity.Property(s => s.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Initial seed data with academic diversity
            entity.HasData(
                new Student
                {
                    Id = 1,
                    FullName = "Elena Rostova",
                    Email = "elena.rostova@university.edu",
                    PhoneNumber = "+1 (555) 234-5678",
                    Department = "Computer Science",
                    EnrollmentDate = new DateTime(2023, 9, 1),
                    CreatedAt = new DateTime(2023, 9, 1, 8, 30, 0, DateTimeKind.Utc)
                },
                new Student
                {
                    Id = 2,
                    FullName = "Marcus Vance",
                    Email = "marcus.vance@university.edu",
                    PhoneNumber = "+1 (555) 876-5432",
                    Department = "Architecture",
                    EnrollmentDate = new DateTime(2023, 9, 15),
                    CreatedAt = new DateTime(2023, 9, 15, 9, 0, 0, DateTimeKind.Utc)
                },
                new Student
                {
                    Id = 3,
                    FullName = "Sophia Chen",
                    Email = "sophia.chen@university.edu",
                    PhoneNumber = "+1 (555) 345-6789",
                    Department = "Biomedical Engineering",
                    EnrollmentDate = new DateTime(2024, 1, 10),
                    CreatedAt = new DateTime(2024, 1, 10, 10, 15, 0, DateTimeKind.Utc)
                },
                new Student
                {
                    Id = 4,
                    FullName = "Arthur Pendelton",
                    Email = "arthur.pendelton@university.edu",
                    PhoneNumber = "+1 (555) 987-6543",
                    Department = "Classical Literature",
                    EnrollmentDate = new DateTime(2023, 9, 1),
                    CreatedAt = new DateTime(2023, 9, 1, 11, 0, 0, DateTimeKind.Utc)
                },
                new Student
                {
                    Id = 5,
                    FullName = "Amara Okafor",
                    Email = "amara.okafor@university.edu",
                    PhoneNumber = "+1 (555) 456-7890",
                    Department = "Data Science",
                    EnrollmentDate = new DateTime(2024, 2, 1),
                    CreatedAt = new DateTime(2024, 2, 1, 14, 20, 0, DateTimeKind.Utc)
                },
                new Student
                {
                    Id = 6,
                    FullName = "Julian Thorne",
                    Email = "julian.thorne@university.edu",
                    PhoneNumber = "+1 (555) 654-3210",
                    Department = "Economics",
                    EnrollmentDate = new DateTime(2024, 9, 1),
                    CreatedAt = new DateTime(2024, 9, 1, 9, 45, 0, DateTimeKind.Utc)
                }
            );
        });
    }
}
