import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudentRequest, UpdateStudentRequest, StudentStats } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/students';

  getAll(search?: string, department?: string): Observable<Student[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (department && department !== 'All') {
      params = params.set('department', department);
    }
    return this.http.get<Student[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(student: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  update(id: number, student: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.apiUrl}/stats`);
  }
}
