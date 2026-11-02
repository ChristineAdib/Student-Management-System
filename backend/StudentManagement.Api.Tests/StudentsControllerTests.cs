using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using StudentManagement.Api.Controllers;
using StudentManagement.Api.Data;
using StudentManagement.Api.DTOs;
using StudentManagement.Api.Models;
using Xunit;

namespace StudentManagement.Api.Tests;

public class StudentsControllerTests
{
    private StudentDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<StudentDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new StudentDbContext(options);
        context.Database.EnsureCreated();

        // Clear seed data to have controlled test datasets
        context.Students.RemoveRange(context.Students);
        context.SaveChanges();

        return context;
    }

    [Fact]
    public async Task GetAll_ReturnsAllStudents()
    {
        using var context = CreateInMemoryDbContext();
        context.Students.AddRange(
            new Student { Id = 1, FullName = "Alice Martin", Email = "alice@uni.edu", Department = "Physics" },
            new Student { Id = 2, FullName = "Bob Smith", Email = "bob@uni.edu", Department = "Chemistry" }
        );
        await context.SaveChangesAsync();

        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var students = Assert.IsAssignableFrom<IEnumerable<StudentDto>>(okResult.Value);
        Assert.Equal(2, students.Count());
    }

    [Fact]
    public async Task GetById_ReturnsStudent_WhenExists()
    {
        using var context = CreateInMemoryDbContext();
        context.Students.Add(new Student { Id = 10, FullName = "Clara Oswald", Email = "clara@uni.edu", Department = "Literature" });
        await context.SaveChangesAsync();

        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var result = await controller.GetById(10);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var student = Assert.IsType<StudentDto>(okResult.Value);
        Assert.Equal("Clara Oswald", student.FullName);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenDoesNotExist()
    {
        using var context = CreateInMemoryDbContext();
        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var result = await controller.GetById(999);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_AddsStudentSuccessfully()
    {
        using var context = CreateInMemoryDbContext();
        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var dto = new CreateStudentDto
        {
            FullName = "David Tennant",
            Email = "david@uni.edu",
            Department = "Drama",
            PhoneNumber = "+1 555-0101"
        };

        var result = await controller.Create(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var student = Assert.IsType<StudentDto>(createdResult.Value);
        Assert.Equal("David Tennant", student.FullName);
        Assert.True(student.Id > 0);
    }

    [Fact]
    public async Task Create_ReturnsConflict_WhenEmailExists()
    {
        using var context = CreateInMemoryDbContext();
        context.Students.Add(new Student { Id = 1, FullName = "Existing", Email = "duplicate@uni.edu", Department = "Law" });
        await context.SaveChangesAsync();

        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var dto = new CreateStudentDto
        {
            FullName = "Another Student",
            Email = "duplicate@uni.edu",
            Department = "Law"
        };

        var result = await controller.Create(dto);

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_ModifiesStudentSuccessfully()
    {
        using var context = CreateInMemoryDbContext();
        context.Students.Add(new Student { Id = 5, FullName = "Old Name", Email = "old@uni.edu", Department = "Art" });
        await context.SaveChangesAsync();

        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var updateDto = new UpdateStudentDto
        {
            FullName = "New Name",
            Email = "old@uni.edu",
            Department = "Fine Arts",
            PhoneNumber = "+1 555-9999"
        };

        var result = await controller.Update(5, updateDto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var student = Assert.IsType<StudentDto>(okResult.Value);
        Assert.Equal("New Name", student.FullName);
        Assert.Equal("Fine Arts", student.Department);
    }

    [Fact]
    public async Task Delete_RemovesStudentSuccessfully()
    {
        using var context = CreateInMemoryDbContext();
        context.Students.Add(new Student { Id = 7, FullName = "To Delete", Email = "delete@uni.edu", Department = "Music" });
        await context.SaveChangesAsync();

        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var result = await controller.Delete(7);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await context.Students.FindAsync(7));
    }

    [Fact]
    public async Task GetStats_ReturnsAccurateMetrics()
    {
        using var context = CreateInMemoryDbContext();
        context.Students.AddRange(
            new Student { Id = 1, FullName = "A", Email = "a@uni.edu", Department = "CS" },
            new Student { Id = 2, FullName = "B", Email = "b@uni.edu", Department = "CS" },
            new Student { Id = 3, FullName = "C", Email = "c@uni.edu", Department = "Math" }
        );
        await context.SaveChangesAsync();

        var controller = new StudentsController(context, NullLogger<StudentsController>.Instance);

        var result = await controller.GetStats();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var stats = Assert.IsType<StudentStatsDto>(okResult.Value);
        Assert.Equal(3, stats.TotalStudents);
        Assert.Equal(2, stats.TotalDepartments);
    }
}
