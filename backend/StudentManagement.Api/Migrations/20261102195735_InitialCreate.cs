using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StudentManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EnrollmentDate = table.Column<DateTime>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Students",
                columns: new[] { "Id", "CreatedAt", "Department", "Email", "EnrollmentDate", "FullName", "PhoneNumber", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2023, 9, 1, 8, 30, 0, 0, DateTimeKind.Utc), "Computer Science", "elena.rostova@university.edu", new DateTime(2023, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Elena Rostova", "+1 (555) 234-5678", null },
                    { 2, new DateTime(2023, 9, 15, 9, 0, 0, 0, DateTimeKind.Utc), "Architecture", "marcus.vance@university.edu", new DateTime(2023, 9, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Marcus Vance", "+1 (555) 876-5432", null },
                    { 3, new DateTime(2024, 1, 10, 10, 15, 0, 0, DateTimeKind.Utc), "Biomedical Engineering", "sophia.chen@university.edu", new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sophia Chen", "+1 (555) 345-6789", null },
                    { 4, new DateTime(2023, 9, 1, 11, 0, 0, 0, DateTimeKind.Utc), "Classical Literature", "arthur.pendelton@university.edu", new DateTime(2023, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Arthur Pendelton", "+1 (555) 987-6543", null },
                    { 5, new DateTime(2024, 2, 1, 14, 20, 0, 0, DateTimeKind.Utc), "Data Science", "amara.okafor@university.edu", new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Amara Okafor", "+1 (555) 456-7890", null },
                    { 6, new DateTime(2024, 9, 1, 9, 45, 0, 0, DateTimeKind.Utc), "Economics", "julian.thorne@university.edu", new DateTime(2024, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Julian Thorne", "+1 (555) 654-3210", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Students_Email",
                table: "Students",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Students");
        }
    }
}
