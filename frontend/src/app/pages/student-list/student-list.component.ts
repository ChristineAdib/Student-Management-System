import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { Student } from '../../models/student.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="students-page">
      <!-- Page Sub-Header / Controls -->
      <div class="table-controls academic-card">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Search by student name, email, or phone..."
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
          />
          @if (searchQuery()) {
            <button type="button" class="clear-btn" (click)="clearSearch()" title="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>

        <div class="filter-actions">
          <div class="filter-group">
            <label for="deptFilter" class="filter-label">Department:</label>
            <select
              id="deptFilter"
              class="filter-select"
              [ngModel]="selectedDepartment()"
              (ngModelChange)="onDepartmentChange($event)"
            >
              <option value="All">All Departments</option>
              @for (dept of departmentList(); track dept) {
                <option [value]="dept">{{ dept }}</option>
              }
            </select>
          </div>

          <a routerLink="/students/new" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Student</span>
          </a>
        </div>
      </div>

      <!-- Result Summary Bar -->
      <div class="summary-bar">
        <div class="count-indicator">
          <span>Displaying <strong>{{ filteredStudents().length }}</strong> of <strong>{{ students().length }}</strong> enrolled students</span>
          @if (searchQuery() || selectedDepartment() !== 'All') {
            <span class="active-filter-badge">Filters Active</span>
          }
        </div>
        <button type="button" class="refresh-btn" (click)="loadStudents()" [disabled]="loading()" title="Refresh data">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="state-card academic-card">
          <div class="spinner"></div>
          <p class="state-text">Fetching student records from database...</p>
        </div>
      }

      <!-- Error State -->
      @if (error() && !loading()) {
        <div class="state-card academic-card error-state">
          <div class="state-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 class="state-title">Error Loading Students</h3>
          <p class="state-text">{{ error() }}</p>
          <button type="button" class="btn btn-secondary" (click)="loadStudents()">Retry</button>
        </div>
      }

      <!-- Data Table (Desktop & Tablet) -->
      @if (!loading() && !error()) {
        @if (filteredStudents().length > 0) {
          <div class="table-container academic-card">
            <table class="students-table">
              <thead>
                <tr>
                  <th class="th-id">Student ID</th>
                  <th class="th-name">Full Name</th>
                  <th class="th-contact">Email & Contact</th>
                  <th class="th-dept">Department</th>
                  <th class="th-date">Enrollment Date</th>
                  <th class="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (student of filteredStudents(); track student.id) {
                  <tr>
                    <td class="td-id">
                      <span class="id-badge">#{{ student.id }}</span>
                    </td>
                    <td class="td-name">
                      <div class="student-name-cell">
                        <div class="student-avatar-circle">
                          {{ getInitials(student.fullName) }}
                        </div>
                        <div class="student-name-meta">
                          <a [routerLink]="['/students', student.id]" class="student-link">
                            {{ student.fullName }}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td class="td-contact">
                      <div class="contact-info">
                        <span class="email-text">{{ student.email }}</span>
                        @if (student.phoneNumber) {
                          <span class="phone-text">{{ student.phoneNumber }}</span>
                        } @else {
                          <span class="phone-empty">—</span>
                        }
                      </div>
                    </td>
                    <td class="td-dept">
                      <span class="badge badge-warm">{{ student.department }}</span>
                    </td>
                    <td class="td-date">
                      @if (student.enrollmentDate) {
                        <span class="date-text">{{ student.enrollmentDate | date:'mediumDate' }}</span>
                      } @else {
                        <span class="date-empty">Not specified</span>
                      }
                    </td>
                    <td class="td-actions">
                      <div class="action-buttons">
                        <a
                          [routerLink]="['/students', student.id]"
                          class="btn-action view"
                          title="View Details"
                          aria-label="View student details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </a>
                        <a
                          [routerLink]="['/students', student.id, 'edit']"
                          class="btn-action edit"
                          title="Edit Record"
                          aria-label="Edit student"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </a>
                        <button
                          type="button"
                          class="btn-action delete"
                          (click)="openDeleteModal(student)"
                          title="Delete Record"
                          aria-label="Delete student"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View (displayed on small screens <= 768px) -->
          <div class="mobile-cards-view">
            @for (student of filteredStudents(); track student.id) {
              <div class="mobile-student-card academic-card">
                <div class="mobile-card-top">
                  <div class="student-avatar-circle">
                    {{ getInitials(student.fullName) }}
                  </div>
                  <div class="mobile-student-primary">
                    <a [routerLink]="['/students', student.id]" class="student-link">
                      {{ student.fullName }}
                    </a>
                    <span class="id-badge">ID #{{ student.id }}</span>
                  </div>
                  <span class="badge badge-warm">{{ student.department }}</span>
                </div>

                <div class="mobile-card-details">
                  <div class="mobile-detail-row">
                    <span class="mobile-detail-label">Email:</span>
                    <span class="mobile-detail-value">{{ student.email }}</span>
                  </div>
                  @if (student.phoneNumber) {
                    <div class="mobile-detail-row">
                      <span class="mobile-detail-label">Phone:</span>
                      <span class="mobile-detail-value">{{ student.phoneNumber }}</span>
                    </div>
                  }
                  <div class="mobile-detail-row">
                    <span class="mobile-detail-label">Enrolled:</span>
                    <span class="mobile-detail-value">
                      {{ student.enrollmentDate ? (student.enrollmentDate | date:'mediumDate') : 'Not specified' }}
                    </span>
                  </div>
                </div>

                <div class="mobile-card-actions">
                  <a [routerLink]="['/students', student.id]" class="btn btn-sm btn-secondary">
                    View
                  </a>
                  <a [routerLink]="['/students', student.id, 'edit']" class="btn btn-sm btn-outline">
                    Edit
                  </a>
                  <button type="button" class="btn btn-sm btn-danger" (click)="openDeleteModal(student)">
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="state-card academic-card empty-state">
            <div class="state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="8.01"></line>
                <line x1="11" y1="12" x2="11" y2="14"></line>
              </svg>
            </div>
            <h3 class="state-title">No Students Found</h3>
            <p class="state-text">
              @if (searchQuery() || selectedDepartment() !== 'All') {
                No student records matched your current search and filter criteria.
              } @else {
                There are no students registered in the database yet.
              }
            </p>
            <div class="empty-actions">
              @if (searchQuery() || selectedDepartment() !== 'All') {
                <button type="button" class="btn btn-secondary" (click)="resetFilters()">
                  Clear Search Filters
                </button>
              }
              <a routerLink="/students/new" class="btn btn-primary">
                Add First Student
              </a>
            </div>
          </div>
        }
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        [student]="studentToDelete()"
        [isDeleting]="isDeleting()"
        (confirm)="confirmDelete()"
        (cancel)="closeDeleteModal()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .students-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .table-controls {
      padding: 1.125rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 460px;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-subtle);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 2.25rem 0.625rem 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background-color: var(--bg-card-subtle);
      color: var(--text-main);
      transition: var(--transition);

      &:focus {
        outline: none;
        border-color: var(--primary);
        background-color: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(164, 120, 90, 0.15);
      }

      &::placeholder {
        color: var(--text-subtle);
      }
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-subtle);
      padding: 0.2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--text-main);
        background-color: var(--bg-secondary);
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .filter-select {
      padding: 0.625rem 2rem 0.625rem 0.875rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background-color: var(--bg-card-subtle);
      color: var(--text-main);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B5E3C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 14px;
      transition: var(--transition);

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(164, 120, 90, 0.15);
      }
    }

    .summary-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .count-indicator {
      display: flex;
      align-items: center;
      gap: 0.625rem;

      strong {
        color: var(--text-heading);
      }
    }

    .active-filter-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      background-color: var(--primary-light);
      color: var(--primary-hover);
      border-radius: var(--radius-full);
      font-size: 0.6875rem;
      font-weight: 600;
    }

    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--primary);
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);

      &:hover:not(:disabled) {
        background-color: var(--primary-light);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* Table styles */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--border-subtle);

      @media (max-width: 768px) {
        display: none; /* Switch to cards on mobile */
      }
    }

    .students-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 0.875rem 1.125rem;
        background-color: var(--bg-card-subtle);
        border-bottom: 1px solid var(--border-color);
        color: var(--text-heading);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }

      td {
        padding: 0.875rem 1.125rem;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.875rem;
        color: var(--text-main);
        vertical-align: middle;
      }

      tr:last-child td {
        border-bottom: none;
      }

      tr:hover td {
        background-color: var(--bg-card-subtle);
      }
    }

    .th-id { width: 90px; }
    .th-name { min-width: 200px; }
    .th-contact { min-width: 220px; }
    .th-dept { min-width: 170px; }
    .th-date { min-width: 130px; }
    .th-actions { width: 130px; text-align: right; }

    .id-badge {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      background-color: var(--primary-light);
      padding: 0.2rem 0.45rem;
      border-radius: var(--radius-sm);
    }

    .student-name-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .student-avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: var(--bg-secondary);
      color: var(--text-heading);
      font-weight: 700;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid var(--border-subtle);
    }

    .student-link {
      font-weight: 600;
      color: var(--text-heading);

      &:hover {
        color: var(--primary);
        text-decoration: underline;
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .email-text {
      color: var(--text-main);
      font-size: 0.8125rem;
    }

    .phone-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .phone-empty, .date-empty {
      color: var(--text-subtle);
      font-size: 0.75rem;
    }

    .date-text {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.375rem;
    }

    .btn-action {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      border: 1px solid transparent;
      transition: var(--transition);

      &:hover {
        background-color: var(--bg-secondary);
        color: var(--text-heading);
        border-color: var(--border-subtle);
      }

      &.view:hover {
        color: var(--primary);
        background-color: var(--primary-light);
        border-color: rgba(164, 120, 90, 0.2);
      }

      &.edit:hover {
        color: var(--accent-caramel);
        background-color: #FAF5F0;
        border-color: var(--border-subtle);
      }

      &.delete:hover {
        color: var(--danger);
        background-color: var(--danger-bg);
        border-color: rgba(178, 83, 62, 0.2);
      }
    }

    /* Mobile Cards View */
    .mobile-cards-view {
      display: none;
      flex-direction: column;
      gap: 1rem;

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .mobile-student-card {
      padding: 1.125rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .mobile-card-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mobile-student-primary {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .mobile-card-details {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.625rem 0.875rem;
      background-color: var(--bg-card-subtle);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
    }

    .mobile-detail-row {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .mobile-detail-label {
      color: var(--text-subtle);
      font-weight: 500;
    }

    .mobile-detail-value {
      color: var(--text-main);
      font-weight: 500;
      text-align: right;
    }

    .mobile-card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-subtle);
    }

    /* State styles */
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
      color: var(--text-subtle);
      display: flex;
      align-items: center;
      justify-content: center;

      &.danger {
        background-color: var(--danger-bg);
        color: var(--danger);
      }
    }

    .state-title {
      font-size: 1.125rem;
      color: var(--text-heading);
      font-weight: 600;
    }

    .state-text {
      font-size: 0.875rem;
      color: var(--text-muted);
      max-width: 420px;
    }

    .empty-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
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
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  students = signal<Student[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchQuery = signal<string>('');
  selectedDepartment = signal<string>('All');

  // Delete modal state
  isDeleteModalOpen = signal<boolean>(false);
  studentToDelete = signal<Student | null>(null);
  isDeleting = signal<boolean>(false);

  // Computed distinct departments
  departmentList = computed(() => {
    const list = this.students().map(s => s.department);
    return Array.from(new Set(list)).sort();
  });

  // Filtered students computed signal
  filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const dept = this.selectedDepartment();

    return this.students().filter(s => {
      const matchesSearch = !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phoneNumber && s.phoneNumber.toLowerCase().includes(q)) ||
        s.id.toString().includes(q);

      const matchesDept = dept === 'All' || s.department === dept;

      return matchesSearch && matchesDept;
    });
  });

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load students from database.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onDepartmentChange(value: string): void {
    this.selectedDepartment.set(value);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedDepartment.set('All');
  }

  openDeleteModal(student: Student): void {
    this.studentToDelete.set(student);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (!this.isDeleting()) {
      this.isDeleteModalOpen.set(false);
      this.studentToDelete.set(null);
    }
  }

  confirmDelete(): void {
    const student = this.studentToDelete();
    if (!student) return;

    this.isDeleting.set(true);

    this.studentService.delete(student.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.studentToDelete.set(null);
        this.notificationService.success(`Student ${student.fullName} (ID #${student.id}) was successfully deleted.`);
        this.loadStudents(); // Refresh list from backend
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
