import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { StudentStats } from '../../models/student.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Banner -->
      <div class="welcome-banner academic-card">
        <div class="banner-content">
          <div class="banner-badge">
            <span class="pulse-dot"></span>
            Academic Term Active
          </div>
          <h2 class="banner-title">Student Management Overview</h2>
          <p class="banner-desc">
            Real-time enrollment metrics, department distribution, and recent student records from the database.
          </p>
        </div>
        <div class="banner-actions">
          <a routerLink="/students/new" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Register Student</span>
          </a>
          <a routerLink="/students" class="btn btn-secondary">
            <span>View All Records</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading database statistics...</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="error-text">
            <h4>Failed to load dashboard metrics</h4>
            <p>{{ error() }}</p>
          </div>
          <button type="button" class="btn btn-sm btn-outline" (click)="loadStats()">Retry</button>
        </div>
      }

      <!-- Stats Grid -->
      @if (stats(); as data) {
        <div class="metrics-grid">
          <div class="metric-card academic-card">
            <div class="metric-icon-box warm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="metric-details">
              <span class="metric-label">Total Enrolled Students</span>
              <span class="metric-value">{{ data.totalStudents }}</span>
              <span class="metric-subtext">Active database records</span>
            </div>
          </div>

          <div class="metric-card academic-card">
            <div class="metric-icon-box gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div class="metric-details">
              <span class="metric-label">Active Departments</span>
              <span class="metric-value">{{ data.totalDepartments }}</span>
              <span class="metric-subtext">Across academic faculties</span>
            </div>
          </div>

          <div class="metric-card academic-card">
            <div class="metric-icon-box sage">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div class="metric-details">
              <span class="metric-label">Recent Additions</span>
              <span class="metric-value">{{ data.recentStudents.length }}</span>
              <span class="metric-subtext">Newly registered entries</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Layout Split -->
        <div class="dashboard-split">
          <!-- Department Distribution -->
          <div class="academic-card split-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <h3 class="panel-title">Department Distribution</h3>
                <p class="panel-subtitle">Student enrollment grouped by department</p>
              </div>
              <span class="badge badge-warm">{{ data.totalDepartments }} Depts</span>
            </div>

            <div class="dept-list">
              @for (dept of data.departments; track dept.department) {
                <div class="dept-row">
                  <div class="dept-header-line">
                    <span class="dept-name">{{ dept.department }}</span>
                    <span class="dept-count">{{ dept.count }} {{ dept.count === 1 ? 'student' : 'students' }}</span>
                  </div>
                  <div class="dept-bar-track">
                    <div 
                      class="dept-bar-fill" 
                      [style.width.%]="data.totalStudents > 0 ? (dept.count / data.totalStudents) * 100 : 0">
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-compact">No department data found.</div>
              }
            </div>
          </div>

          <!-- Recently Added Students -->
          <div class="academic-card split-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <h3 class="panel-title">Recently Added Students</h3>
                <p class="panel-subtitle">Latest additions to the registry</p>
              </div>
              <a routerLink="/students" class="btn btn-sm btn-outline">View Directory</a>
            </div>

            <div class="recent-list">
              @for (student of data.recentStudents; track student.id) {
                <div class="recent-item">
                  <div class="recent-avatar">
                    {{ getInitials(student.fullName) }}
                  </div>
                  <div class="recent-info">
                    <div class="recent-name-line">
                      <span class="recent-name">{{ student.fullName }}</span>
                      <span class="badge badge-cream">ID #{{ student.id }}</span>
                    </div>
                    <div class="recent-meta">
                      <span>{{ student.department }}</span>
                      <span class="meta-dot">•</span>
                      <span>{{ student.email }}</span>
                    </div>
                  </div>
                  <a [routerLink]="['/students', student.id]" class="btn btn-sm btn-secondary" title="View Student">
                    Details
                  </a>
                </div>
              } @empty {
                <div class="empty-compact">No students currently enrolled.</div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .welcome-banner {
      padding: 1.75rem 2rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #EDF3EF 100%);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .banner-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      background-color: var(--accent-sage-light);
      color: var(--accent-sage-text);
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      border: 1px solid rgba(167, 184, 162, 0.4);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--accent-sage);
    }

    .banner-title {
      font-family: var(--font-serif);
      font-size: 1.625rem;
      font-weight: 700;
      color: var(--text-heading);
      margin-bottom: 0.35rem;
      letter-spacing: -0.01em;
    }

    .banner-desc {
      font-size: 0.9375rem;
      color: var(--text-muted);
      max-width: 580px;
    }

    .banner-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid var(--border-subtle);
    }

    .metric-icon-box {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.warm {
        background-color: var(--primary-light);
        color: var(--primary);
      }

      &.gold {
        background-color: var(--accent-sage-light);
        color: var(--primary);
      }

      &.sage {
        background-color: var(--bg-card-subtle);
        color: var(--primary-hover);
      }
    }

    .metric-details {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-heading);
      line-height: 1.2;
      margin: 0.15rem 0;
    }

    .metric-subtext {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }

    .dashboard-split {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .split-panel {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.875rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .panel-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--text-heading);
    }

    .panel-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .dept-list {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
    }

    .dept-row {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .dept-header-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .dept-name {
      font-weight: 500;
      color: var(--text-main);
    }

    .dept-count {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .dept-bar-track {
      height: 7px;
      border-radius: var(--radius-full);
      background-color: var(--border-subtle);
      overflow: hidden;
    }

    .dept-bar-fill {
      height: 100%;
      background-color: var(--accent-sage);
      border-radius: var(--radius-full);
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 0.875rem;
      border-radius: var(--radius-md);
      background-color: var(--bg-card-subtle);
      border: 1px solid var(--border-subtle);
      transition: var(--transition);

      &:hover {
        background-color: #FFFFFF;
        border-color: var(--border-color);
        box-shadow: var(--shadow-sm);
      }
    }

    .recent-avatar {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background-color: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .recent-info {
      flex: 1;
      min-width: 0;
    }

    .recent-name-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.15rem;
    }

    .recent-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-heading);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .recent-meta {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta-dot {
      color: var(--border-color);
    }

    .loading-state {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-muted);
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

    .error-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      background-color: var(--danger-bg);
      border: 1px solid rgba(178, 83, 62, 0.25);
      color: var(--danger-text);

      .error-text {
        flex: 1;
        h4 { color: var(--danger-text); font-size: 0.875rem; margin-bottom: 0.15rem; }
        p { font-size: 0.8125rem; }
      }
    }

    .empty-compact {
      padding: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private studentService = inject(StudentService);

  stats = signal<StudentStats | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set(null);

    this.studentService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to connect to the database API.');
        this.loading.set(false);
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
