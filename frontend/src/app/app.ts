import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  isMobileSidebarOpen = signal<boolean>(false);
  currentPageTitle = signal<string>('Dashboard');
  currentPageSubtitle = signal<string>('Academic overview and statistics');

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.updateHeaderMeta(url);
        this.isMobileSidebarOpen.set(false);
      });
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  private updateHeaderMeta(url: string): void {
    if (url.includes('/students/new')) {
      this.currentPageTitle.set('Register Student');
      this.currentPageSubtitle.set('Enroll a new student into the university database');
    } else if (url.includes('/edit')) {
      this.currentPageTitle.set('Edit Student Record');
      this.currentPageSubtitle.set('Update and modify student enrollment information');
    } else if (url.match(/\/students\/\d+/)) {
      this.currentPageTitle.set('Student Profile');
      this.currentPageSubtitle.set('Comprehensive academic and contact information');
    } else if (url.includes('/students')) {
      this.currentPageTitle.set('Students Directory');
      this.currentPageSubtitle.set('Manage, filter, search, and view student records');
    } else {
      this.currentPageTitle.set('Academic Dashboard');
      this.currentPageSubtitle.set('System metrics, department distribution, and recent activity');
    }
  }
}
