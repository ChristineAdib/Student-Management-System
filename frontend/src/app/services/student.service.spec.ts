import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/student.model';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all students', () => {
    const mockStudents: Student[] = [
      {
        id: 1,
        fullName: 'Elena Rostova',
        email: 'elena@university.edu',
        department: 'Computer Science',
        createdAt: '2024-01-01'
      }
    ];

    service.getAll().subscribe(students => {
      expect(students.length).toBe(1);
      expect(students[0].fullName).toBe('Elena Rostova');
    });

    const req = httpMock.expectOne('http://localhost:5000/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);
  });

  it('should get student by id', () => {
    const mockStudent: Student = {
      id: 2,
      fullName: 'Marcus Vance',
      email: 'marcus@university.edu',
      department: 'Architecture',
      createdAt: '2024-01-01'
    };

    service.getById(2).subscribe(student => {
      expect(student.fullName).toBe('Marcus Vance');
    });

    const req = httpMock.expectOne('http://localhost:5000/api/students/2');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudent);
  });
});
