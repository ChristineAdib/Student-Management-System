import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { CreateStudentRequest, UpdateStudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page">
      <!-- Breadcrumb Bar -->
      <div class="nav-bar">
        <a routerLink="/students" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Students Directory</span>
        </a>
      </div>

      <!-- Loading State (in edit mode) -->
      @if (loadingExisting()) {
        <div class="state-card academic-card">
          <div class="spinner"></div>
          <p>Retrieving student record for editing...</p>
        </div>
      } @else {
        <div class="form-card academic-card">
          <div class="form-header">
            <div class="header-icon">
              @if (isEditMode()) {
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              } @else {
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              }
            </div>
            <div>
              <h2 class="form-title">{{ isEditMode() ? 'Edit Student Record' : 'Register New Student' }}</h2>
              <p class="form-subtitle">
                {{ isEditMode() 
                  ? 'Update information for student #' + studentId() + ' in the persistent database.' 
                  : 'Enter the student details to create a new enrollment record.' 
                }}
              </p>
            </div>
          </div>

          <!-- Server Error Alert -->
          @if (serverError()) {
            <div class="server-error-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ serverError() }}</span>
            </div>
          }

          <form [formGroup]="studentForm" (ngSubmit)="onSubmit()" class="student-form" novalidate>
            <!-- Full Name -->
            <div class="form-group" [class.has-error]="isFieldInvalid('fullName')">
              <label for="fullName" class="form-label">
                Full Name <span class="req-star">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                class="form-control"
                placeholder="e.g. Benjamin Montgomery"
                autocomplete="name"
              />
              @if (isFieldInvalid('fullName')) {
                <div class="error-msg">
                  @if (studentForm.get('fullName')?.errors?.['required']) {
                    <span>Full name is required.</span>
                  } @else if (studentForm.get('fullName')?.errors?.['minlength']) {
                    <span>Full name must be at least 2 characters long.</span>
                  } @else if (studentForm.get('fullName')?.errors?.['maxlength']) {
                    <span>Full name cannot exceed 100 characters.</span>
                  }
                </div>
              }
            </div>

            <!-- Email Address -->
            <div class="form-group" [class.has-error]="isFieldInvalid('email')">
              <label for="email" class="form-label">
                Email Address <span class="req-star">*</span>
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="e.g. student.name@university.edu"
                autocomplete="email"
              />
              @if (isFieldInvalid('email')) {
                <div class="error-msg">
                  @if (studentForm.get('email')?.errors?.['required']) {
                    <span>Email address is required.</span>
                  } @else if (studentForm.get('email')?.errors?.['email']) {
                    <span>Please enter a valid email format (e.g. student&#64;university.edu).</span>
                  }
                </div>
              }
            </div>

            <!-- Department & Phone Grid -->
            <div class="form-row-2">
              <!-- Department -->
              <div class="form-group" [class.has-error]="isFieldInvalid('department')">
                <label for="department" class="form-label">
                  Department <span class="req-star">*</span>
                </label>
                <div class="dept-input-wrap">
                  <select
                    id="department"
                    formControlName="department"
                    class="form-control form-select"
                  >
                    <option value="" disabled>Select an academic department...</option>
                    @for (dept of commonDepartments; track dept) {
                      <option [value]="dept">{{ dept }}</option>
                    }
                  </select>
                </div>
                @if (isFieldInvalid('department')) {
                  <div class="error-msg">
                    <span>Department is required.</span>
                  </div>
                }
              </div>

              <!-- Phone Number -->
              <div class="form-group" [class.has-error]="isFieldInvalid('phoneNumber')">
                <label for="phoneNumber" class="form-label">
                  Phone Number <span class="optional-tag">(Optional)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  formControlName="phoneNumber"
                  class="form-control"
                  placeholder="e.g. +1 (555) 019-2834"
                  autocomplete="tel"
                />
                @if (isFieldInvalid('phoneNumber')) {
                  <div class="error-msg">
                    <span>Please provide a valid phone number.</span>
                  </div>
                }
              </div>
            </div>

            <!-- Enrollment Date -->
            <div class="form-group" [class.has-error]="isFieldInvalid('enrollmentDate')">
              <label for="enrollmentDate" class="form-label">
                Enrollment Date <span class="optional-tag">(Optional)</span>
              </label>
              <input
                id="enrollmentDate"
                type="date"
                formControlName="enrollmentDate"
                class="form-control date-control"
              />
              <span class="field-hint">The date the student officially joined the academic program.</span>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="onCancel()"
                [disabled]="isSubmitting()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="studentForm.invalid || isSubmitting()"
              >
                @if (isSubmitting()) {
                  <span class="btn-spinner"></span>
                  <span>{{ isEditMode() ? 'Updating...' : 'Registering...' }}</span>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{{ isEditMode() ? 'Save Changes' : 'Register Student' }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 720px;
      margin: 0 auto;
      width: 100%;
    }

    .nav-bar {
      display: flex;
      align-items: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary);
      padding: 0.35rem 0.5rem;
      border-radius: var(--radius-sm);

      &:hover {
        background-color: var(--primary-light);
        color: var(--primary-hover);
      }
    }

    .form-card {
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .form-header {
      padding: 1.75rem 2rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #F7F2E8 100%);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background-color: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .form-title {
      font-family: var(--font-serif);
      font-size: 1.375rem;
      color: var(--text-heading);
      margin-bottom: 0.2rem;
    }

    .form-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .server-error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      margin: 1.5rem 2rem 0;
      background-color: var(--danger-bg);
      border: 1px solid rgba(178, 83, 62, 0.3);
      border-radius: var(--radius-md);
      color: var(--danger-text);
      font-size: 0.875rem;
    }

    .student-form {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      &.has-error {
        .form-control {
          border-color: var(--danger);
          background-color: #FDF9F8;

          &:focus {
            box-shadow: 0 0 0 3px rgba(178, 83, 62, 0.15);
          }
        }

        .form-label {
          color: var(--danger-text);
        }
      }
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-heading);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .req-star {
      color: var(--danger);
      font-weight: 700;
    }

    .optional-tag {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--text-subtle);
    }

    .form-control {
      padding: 0.6875rem 0.875rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      background-color: #FFFFFF;
      color: var(--text-main);
      transition: var(--transition);

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(81, 99, 86, 0.18);
      }

      &::placeholder {
        color: var(--text-subtle);
      }
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23516356' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.875rem center;
      background-size: 14px;
      padding-right: 2.25rem;
    }

    .date-control {
      max-width: 280px;
    }

    .error-msg {
      font-size: 0.75rem;
      color: var(--danger);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }

    .form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.875rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
      margin-top: 0.5rem;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .state-card {
      padding: 3.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  isEditMode = signal<boolean>(false);
  studentId = signal<number | null>(null);
  loadingExisting = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  serverError = signal<string | null>(null);

  commonDepartments = [
    'Computer Science',
    'Architecture',
    'Biomedical Engineering',
    'Classical Literature',
    'Data Science',
    'Economics',
    'Business Administration',
    'Fine Arts & Design',
    'Mathematics & Statistics',
    'Psychology & Neuroscience',
    'Mechanical Engineering'
  ];

  studentForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phoneNumber: ['', [Validators.maxLength(20)]],
    department: ['', [Validators.required, Validators.maxLength(100)]],
    enrollmentDate: ['']
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = parseInt(idParam, 10);
        if (!isNaN(id)) {
          this.isEditMode.set(true);
          this.studentId.set(id);
          this.loadStudentForEdit(id);
        }
      }
    });
  }

  loadStudentForEdit(id: number): void {
    this.loadingExisting.set(true);
    this.serverError.set(null);

    this.studentService.getById(id).subscribe({
      next: (student) => {
        let formattedDate = '';
        if (student.enrollmentDate) {
          // Format as YYYY-MM-DD for date input
          formattedDate = student.enrollmentDate.substring(0, 10);
        }

        this.studentForm.patchValue({
          fullName: student.fullName,
          email: student.email,
          phoneNumber: student.phoneNumber || '',
          department: student.department,
          enrollmentDate: formattedDate
        });

        this.loadingExisting.set(false);
      },
      error: (err) => {
        this.loadingExisting.set(false);
        this.serverError.set(err.error?.message || err.message || 'Failed to load existing student record.');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.studentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const formValues = this.studentForm.value;
    const enrollmentDateVal = formValues.enrollmentDate ? new Date(formValues.enrollmentDate).toISOString() : null;

    if (this.isEditMode()) {
      const id = this.studentId();
      if (!id) return;

      const updatePayload: UpdateStudentRequest = {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phoneNumber: formValues.phoneNumber ? formValues.phoneNumber.trim() : null,
        department: formValues.department,
        enrollmentDate: enrollmentDateVal
      };

      this.studentService.update(id, updatePayload).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.notificationService.success(`Student ${updated.fullName} was successfully updated.`);
          this.router.navigate(['/students', updated.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Failed to update student record.';
          this.serverError.set(msg);
          this.notificationService.error(msg, 'Update Failed');
        }
      });
    } else {
      const createPayload: CreateStudentRequest = {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phoneNumber: formValues.phoneNumber ? formValues.phoneNumber.trim() : null,
        department: formValues.department,
        enrollmentDate: enrollmentDateVal
      };

      this.studentService.create(createPayload).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.notificationService.success(`Student ${created.fullName} was enrolled successfully.`);
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Failed to create student record.';
          this.serverError.set(msg);
          this.notificationService.error(msg, 'Registration Failed');
        }
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode() && this.studentId()) {
      this.router.navigate(['/students', this.studentId()]);
    } else {
      this.router.navigate(['/students']);
    }
  }
}
