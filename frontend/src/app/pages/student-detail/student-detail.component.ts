import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { Student } from '../../models/student.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="student-detail-page">
      <!-- Breadcrumb / Back Bar -->
      <div class="nav-bar">
        <a routerLink="/students" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Students Directory</span>
        </a>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="state-card academic-card">
          <div class="spinner"></div>
          <p>Loading student profile...</p>
        </div>
      }

      <!-- Error State -->
      @if (error() && !loading()) {
        <div class="state-card academic-card error-state">
          <div class="state-icon danger">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 class="state-title">Student Not Found</h3>
          <p class="state-text">{{ error() }}</p>
          <div class="state-actions">
            <a routerLink="/students" class="btn btn-primary">Return to Directory</a>
          </div>
        </div>
      }

      <!-- Student Record Detail -->
      @if (student(); as s) {
        <div class="profile-card academic-card">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="profile-avatar-large">
              {{ getInitials(s.fullName) }}
            </div>
            <div class="profile-intro">
              <div class="intro-badges">
                <span class="id-badge-large">Student ID #{{ s.id }}</span>
                <span class="badge badge-warm">{{ s.department }}</span>
              </div>
              <h2 class="student-title">{{ s.fullName }}</h2>
              <p class="student-subtitle">{{ s.email }}</p>
            </div>
            <div class="profile-actions">
              <a [routerLink]="['/students', s.id, 'edit']" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit Record</span>
              </a>
              <button type="button" class="btn btn-danger" (click)="openDeleteModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>

          <!-- Academic Record Information -->
          <div class="profile-body">
            <h3 class="section-title">Academic & Contact Information</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Full Name</span>
                <span class="info-value strong">{{ s.fullName }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Student ID</span>
                <span class="info-value font-mono">#{{ s.id }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Email Address</span>
                <span class="info-value">
                  <a [href]="'mailto:' + s.email" class="email-link">{{ s.email }}</a>
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Phone Number</span>
                <span class="info-value">
                  {{ s.phoneNumber ? s.phoneNumber : 'Not provided' }}
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">
                  <span class="badge badge-warm">{{ s.department }}</span>
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Enrollment Date</span>
                <span class="info-value">
                  {{ s.enrollmentDate ? (s.enrollmentDate | date:'longDate') : 'Not specified' }}
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Record Created</span>
                <span class="info-value text-muted-subtle">
                  {{ s.createdAt | date:'medium' }}
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Last Updated</span>
                <span class="info-value text-muted-subtle">
                  {{ s.updatedAt ? (s.updatedAt | date:'medium') : 'No updates recorded' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        [student]="student()"
        [isDeleting]="isDeleting()"
        (confirm)="confirmDelete()"
        (cancel)="closeDeleteModal()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .student-detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 900px;
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

    .profile-card {
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .profile-header {
      padding: 2rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #F7F2E8 100%);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .profile-avatar-large {
      width: 76px;
      height: 76px;
      border-radius: var(--radius-full);
      background-color: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 2px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .profile-intro {
      flex: 1;
      min-width: 240px;
    }

    .intro-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .id-badge-large {
      font-family: monospace;
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--primary);
      background-color: var(--primary-light);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .student-title {
      font-family: var(--font-serif);
      font-size: 1.625rem;
      color: var(--text-heading);
      margin-bottom: 0.25rem;
      letter-spacing: -0.01em;
    }

    .student-subtitle {
      font-size: 0.9375rem;
      color: var(--text-muted);
    }

    .profile-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .profile-body {
      padding: 2rem;
    }

    .section-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--text-heading);
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem 2rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-subtle);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .info-value {
      font-size: 0.9375rem;
      color: var(--text-main);

      &.strong {
        font-weight: 600;
        color: var(--text-heading);
      }

      &.font-mono {
        font-family: monospace;
        font-weight: 600;
        color: var(--primary);
      }
    }

    .email-link {
      color: var(--primary);
      text-decoration: underline;

      &:hover {
        color: var(--primary-hover);
      }
    }

    .text-muted-subtle {
      color: var(--text-muted);
      font-size: 0.875rem;
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

    .state-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      &.danger {
        background-color: var(--danger-bg);
        color: var(--danger);
      }
    }

    .state-title {
      font-size: 1.25rem;
      color: var(--text-heading);
      font-weight: 600;
    }

    .state-text {
      font-size: 0.9375rem;
      color: var(--text-muted);
      max-width: 440px;
    }

    .state-actions {
      margin-top: 0.5rem;
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
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  student = signal<Student | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  isDeleteModalOpen = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = parseInt(idParam, 10);
        if (!isNaN(id)) {
          this.loadStudent(id);
        } else {
          this.error.set('Invalid student identifier provided.');
          this.loading.set(false);
        }
      }
    });
  }

  loadStudent(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.studentService.getById(id).subscribe({
      next: (data) => {
        this.student.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message || `Student with ID #${id} does not exist.`);
        this.loading.set(false);
      }
    });
  }

  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (!this.isDeleting()) {
      this.isDeleteModalOpen.set(false);
    }
  }

  confirmDelete(): void {
    const s = this.student();
    if (!s) return;

    this.isDeleting.set(true);

    this.studentService.delete(s.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.notificationService.success(`Student ${s.fullName} was deleted from database.`);
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.isDeleting.set(false);
        const msg = err.error?.message || err.message || 'Failed to delete student.';
        this.notificationService.error(msg, 'Deletion Failed');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
