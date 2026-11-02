import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<ToastMessage[]>([]);

  success(message: string, title = 'Success'): void {
    this.addToast('success', title, message);
  }

  error(message: string, title = 'Error'): void {
    this.addToast('error', title, message);
  }

  info(message: string, title = 'Notice'): void {
    this.addToast('info', title, message);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  private addToast(type: 'success' | 'error' | 'info', title: string, message: string): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message };
    
    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, 4500);
  }
}
