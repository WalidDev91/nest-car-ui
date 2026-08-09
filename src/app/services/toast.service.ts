import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  toasts = signal<Toast[]>([]);

  private nextId = 0;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'danger');
  }

  private show(message: string, type: 'success' | 'danger' | 'info'): void {

    const id = this.nextId++;

    this.toasts.update(list => [...list, { id, message, type }]);

    setTimeout(() => this.dismiss(id), 4000);

  }

  dismiss(id: number): void {

    this.toasts.update(list => list.filter(t => t.id !== id));

  }

  info(message: string): void {
    this.show(message, 'info');
  }

}