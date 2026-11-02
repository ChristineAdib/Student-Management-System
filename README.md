# Student Management System

A full-stack, enterprise-grade Student Management System designed with the **Warm Academic Elegance** visual identity. Built with an **Angular 20** frontend (Standalone Components, Signals, Reactive Forms) and an **ASP.NET Core 8 Web API** backend connected persistently to **Microsoft SQL Server** via **Entity Framework Core**.

---

## 1. Project Overview & Features

The Student Management System provides a clean, intuitive administration dashboard to manage university student records:

1. **Dashboard Overview**: Displays real-time, database-backed statistics (Total Enrolled Students, Active Academic Departments, and Recent Registrations) alongside department enrollment breakdowns.
2. **Student Directory & Table**: Browse all student records with live search (filtering by name, email, or phone) and department dropdown filtering.
3. **Student Profile Details**: Comprehensive view of an individual student's academic record, contact information, and audit timestamps.
4. **Student Registration**: Clean, validated reactive form to enroll new students into the persistent database.
5. **Student Modification**: Pre-populated update form to edit student information, with immediate validation and database update.
6. **Deletion with Confirmation Dialog**: Modal dialog clearly identifying the student before permanently removing the record from Microsoft SQL Server.
7. **Elegant Notifications**: Non-intrusive toast notification system providing feedback for operations, validation errors, and conflict alerts.

---

## 2. Technology Stack

### Frontend
- **Framework**: Angular 20 (`@angular/core` ^20.3.0)
- **Language**: TypeScript 5.9
- **Architecture**: Standalone Components, Angular Router, Angular Signals (`signal`, `computed`), Reactive Forms (`FormBuilder`, `Validators`), `HttpClient`
- **Design & Styling**: Custom SCSS adhering to the **Warm Academic Elegance** palette (Ivory White `#FAF7F2`, Cream Beige `#F1E3D5`, Sand `#D9C3A8`, Caramel `#C9A078`, Warm Brown `#A4785A`, Deep Brown `#8B5E3C`, Sage Green `#7A9E7E`, Soft Gold `#E7C27D`). **Zero black (`#000000`), zero blues/purples/neon colors.**
- **Testing**: Jasmine + Karma with Headless Chrome runner

### Backend
- **Framework**: ASP.NET Core Web API (.NET 8 LTS)
- **Language**: C# 12
- **Data Access**: Entity Framework Core 8 (`Microsoft.EntityFrameworkCore.SqlServer`)
- **API Documentation**: OpenAPI / Swagger UI
- **Testing**: xUnit + EF Core In-Memory

### Database
- **Engine**: Microsoft SQL Server (Default instance `MSSQLSERVER` / `localhost`)
- **Database Name**: `StudentManagementDb`
- **Schema Management**: EF Core Migrations (`20261102195735_InitialCreate`)

---

## 3. Architecture & Project Structure

```
InternTask2/
├── backend/
│   ├── StudentManagement.Api/           # ASP.NET Core Web API
│   │   ├── Controllers/
│   │   │   └── StudentsController.cs    # RESTful CRUD & Statistics endpoints
│   │   ├── Data/
│   │   │   └── StudentDbContext.cs      # EF Core DbContext, constraints & seed data
│   │   ├── DTOs/
│   │   │   └── StudentDtos.cs           # Request & Response DTOs with validation
│   │   ├── Migrations/                  # EF Core database migrations
│   │   ├── Models/
│   │   │   └── Student.cs               # Student database entity
│   │   ├── Properties/
│   │   │   └── launchSettings.json      # Kestrel ports (5000 http, 5001 https)
│   │   ├── appsettings.json             # SQL Server connection string & logging
│   │   └── Program.cs                   # DI configuration, CORS, Swagger, Migration bootstrap
│   └── StudentManagement.Api.Tests/     # xUnit Backend Unit & Integration Tests
│       └── StudentsControllerTests.cs
│
├── frontend/                            # Angular 20 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── confirm-modal/       # Accessible delete confirmation modal
│   │   │   │   └── toast/               # Floating toast notifications
│   │   │   ├── models/
│   │   │   │   └── student.model.ts     # TypeScript interfaces
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/           # Summary cards, dept charts, recent additions
│   │   │   │   ├── student-detail/      # Profile view with action toolbar
│   │   │   │   ├── student-form/        # Add & Edit reactive form with validation
│   │   │   │   └── student-list/        # Data table with search, filters & mobile cards
│   │   │   ├── services/
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── student.service.ts   # HttpClient CRUD operations
│   │   │   ├── app.html                 # Academic layout shell with sidebar & header
│   │   │   ├── app.scss                 # Responsive styles (desktop, tablet, mobile)
│   │   │   ├── app.routes.ts            # Angular routing
│   │   │   └── app.ts                   # Shell component & route metadata signal
│   │   ├── styles.scss                  # Global design tokens & button styles
│   │   └── index.html                   # DM Sans & Fraunces typography
│   └── angular.json
│
└── README.md
```

---

## 4. Database Configuration & Migrations

The backend is configured to connect to your local Microsoft SQL Server instance using Windows Integrated Security:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=StudentManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

### Automatic Migration on Startup
When the ASP.NET Core API starts, it automatically applies any pending EF Core migrations (`db.Database.Migrate()`) and seeds initial sample records if the database has not yet been populated.

### Manual EF Core Commands
If you wish to apply or create migrations manually:

```powershell
# Navigate to API project directory
cd backend/StudentManagement.Api

# Add a new migration
dotnet ef migrations add <MigrationName>

# Apply migrations to SQL Server
dotnet ef database update
```

---

## 5. API Endpoints Documentation

Interactive Swagger documentation is available at: **`http://localhost:5000/swagger`**

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/students` | Retrieve all students (supports optional `?search=` and `?department=`) | `200 OK` |
| `GET` | `/api/students/{id}` | Retrieve individual student profile by ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/students` | Enroll a new student | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `PUT` | `/api/students/{id}` | Update an existing student record | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/api/students/{id}` | Permanently delete a student record | `204 NoContent`, `404 Not Found` |
| `GET` | `/api/students/stats` | Retrieve aggregated database metrics for the dashboard overview | `200 OK` |

### Sample Create / Update Request Payload
```json
{
  "fullName": "Elena Rostova",
  "email": "elena.rostova@university.edu",
  "phoneNumber": "+1 (555) 234-5678",
  "department": "Computer Science",
  "enrollmentDate": "2023-09-01T00:00:00"
}
```

---

## 6. How to Run Locally

### Prerequisites
- .NET 8 SDK (`dotnet --version`)
- Node.js 18+ and npm (`node -v`, `npm -v`)
- Microsoft SQL Server running locally (Default instance `localhost` or LocalDB)

### Step 1: Start the Backend Web API
In a terminal window:
```powershell
cd backend/StudentManagement.Api
dotnet run --urls "http://localhost:5000"
```
The API is now live at `http://localhost:5000` (Swagger UI at `http://localhost:5000/swagger`).

### Step 2: Start the Frontend Angular Client
In a second terminal window:
```powershell
cd frontend
npm install
npm start
```
The application will open at **`http://localhost:4200`**.

---

## 7. Running Automated Tests

### Backend xUnit Tests
```powershell
dotnet test backend/StudentManagement.Api.Tests
```
*Results: 8 passed, 0 failed.*

### Frontend Karma / Jasmine Tests
```powershell
cd frontend
npx ng test --watch=false --browsers=ChromeHeadless
```
*Results: 6 passed, 0 failed.*

---

## 8. Verification & Environment Notes

- **Database Persistence**: Tested and verified on Microsoft SQL Server (`MSSQLSERVER`). Records persist across API and machine restarts.
- **CORS**: Configured in ASP.NET Core pipeline to permit requests from `http://localhost:4200`, `http://127.0.0.1:4200`, and `http://localhost:4201`.
- **Responsive Layout**: Designed and verified across desktop (1440px), laptop (1024px), tablet (768px), and mobile (390px, 360px) viewports with mobile drawer navigation and responsive data card fallbacks.
