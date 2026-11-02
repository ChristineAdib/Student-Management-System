import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | Student Management'
  },
  {
    path: 'students',
    loadComponent: () => import('./pages/student-list/student-list.component').then(m => m.StudentListComponent),
    title: 'Students Directory | Student Management'
  },
  {
    path: 'students/new',
    loadComponent: () => import('./pages/student-form/student-form.component').then(m => m.StudentFormComponent),
    title: 'Register Student | Student Management'
  },
  {
    path: 'students/:id',
    loadComponent: () => import('./pages/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
    title: 'Student Profile | Student Management'
  },
  {
    path: 'students/:id/edit',
    loadComponent: () => import('./pages/student-form/student-form.component').then(m => m.StudentFormComponent),
    title: 'Edit Student | Student Management'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
