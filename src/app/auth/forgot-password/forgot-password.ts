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
  formSubmitted = signal(false);
  loading = signal(false);
  error = signal('');

  constructor(private http: HttpClient) { }

  get emailInvalid(): boolean {
    return this.formSubmitted() && !this.email.trim();
  }

  submit() {

    this.formSubmitted.set(true);
    this.error.set('');

    if (this.emailInvalid) return;

    this.loading.set(true);

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
        // NOTE: intentionally generic — see backend TODO on
        // AuthServiceImpl.forgotPassword to avoid confirming/denying
        // whether an email exists (account enumeration).
        this.error.set('Something went wrong. Please try again.');
        this.loading.set(false);
      }

    });

  }

}