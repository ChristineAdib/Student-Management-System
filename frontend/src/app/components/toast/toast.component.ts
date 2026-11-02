import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-card" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else if (toast.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            }
          </div>
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button type="button" class="toast-close" (click)="notificationService.remove(toast.id)" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      padding: 1rem 1.125rem;
      border-radius: var(--radius-md);
      background: #FFFFFF;
      box-shadow: var(--shadow-dropdown);
      border: 1px solid var(--border-color);
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .toast-success {
      border-left: 4px solid var(--success);
      .toast-icon { color: var(--success); }
    }

    .toast-error {
      border-left: 4px solid var(--danger);
      .toast-icon { color: var(--danger); }
    }

    .toast-info {
      border-left: 4px solid var(--accent-caramel);
      .toast-icon { color: var(--accent-caramel); }
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-heading);
      margin-bottom: 0.2rem;
    }

    .toast-message {
      font-size: 0.8125rem;
      color: var(--text-muted);
      line-height: 1.4;
      word-break: break-word;
    }

    .toast-close {
      flex-shrink: 0;
      color: var(--text-subtle);
      padding: 0.2rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);

      &:hover {
        color: var(--text-main);
        background-color: var(--bg-secondary);
      }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
