import { Component } from '@angular/core';
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
  submitted = false;
  loading = false;
  error = '';

  constructor(private http: HttpClient) { }

  submit() {
    if (!this.email) return;
    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Email not found or server error.';
          this.loading = false;
        }
      });
  }
}
