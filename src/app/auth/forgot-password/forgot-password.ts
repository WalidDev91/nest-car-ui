import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  email = '';
  submitted = signal(false);
  loading = signal(false);
  error = signal('');

  constructor(private http: HttpClient) { }

  submit() {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set('');

    this.http.post(
      `${environment.apiUrl}/auth/forgot-password`,
      { email: this.email },
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.submitted.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Email not found or server error.');
        this.loading.set(false);
      }
    });
  }
}