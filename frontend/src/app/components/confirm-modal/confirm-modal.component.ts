import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && student) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="modal-header-text">
              <h3 class="modal-title">Delete Student Record</h3>
              <p class="modal-subtitle">This action is permanent and cannot be undone.</p>
            </div>
          </div>

          <div class="modal-body">
            <p class="modal-text">Are you sure you want to remove the student record for:</p>
            
            <div class="student-target-card">
              <div class="target-avatar">{{ getInitials(student.fullName) }}</div>
              <div class="target-info">
                <div class="target-name">{{ student.fullName }}</div>
                <div class="target-meta">
                  <span class="target-id">ID #{{ student.id }}</span>
                  <span class="target-dot">•</span>
                  <span class="target-dept">{{ student.department }}</span>
                </div>
                <div class="target-email">{{ student.email }}</div>
              </div>
            </div>

            <p class="modal-warning-note">
              The student will be completely removed from the database and course enrollments.
            </p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isDeleting">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" (click)="onConfirm()" [disabled]="isDeleting">
              @if (isDeleting) {
                <span>Deleting...</span>
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Confirm Delete</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(39, 51, 42, 0.45);
      backdrop-filter: blur(3px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      width: 100%;
      max-width: 480px;
      overflow: hidden;
      animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .modal-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background-color: var(--danger-bg);
      color: var(--danger);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-header-text {
      flex: 1;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-heading);
      margin-bottom: 0.25rem;
    }

    .modal-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .modal-body {
      padding: 0.5rem 1.5rem 1.25rem;
    }

    .modal-text {
      font-size: 0.875rem;
      color: var(--text-main);
      margin-bottom: 0.875rem;
    }

    .student-target-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      background-color: var(--bg-card-subtle);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      margin-bottom: 0.875rem;
    }

    .target-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background-color: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .target-info {
      flex: 1;
      min-width: 0;
    }

    .target-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-heading);
    }

    .target-meta {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-subtle);
      margin: 0.1rem 0;
    }

    .target-id {
      font-weight: 600;
      color: var(--primary);
    }

    .target-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .modal-warning-note {
      font-size: 0.75rem;
      color: var(--danger);
      background: var(--danger-bg);
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-sm);
    }

    .modal-footer {
      padding: 1rem 1.5rem 1.25rem;
      background-color: var(--bg-app);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() student: Student | null = null;
  @Input() isDeleting = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    if (!this.isDeleting) {
      this.cancel.emit();
    }
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
