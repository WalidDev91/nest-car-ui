import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {

  token = '';
  newPassword = '';
  confirmPassword = '';

  loading = signal(false);
  success = signal(false);
  error = signal('');
  formSubmitted = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.error.set('Invalid or missing reset link. Please request a new one.');
    }

  }

  get newPasswordInvalid(): boolean {
    return this.formSubmitted() && this.newPassword.length < 6;
  }

  get confirmPasswordInvalid(): boolean {
    return this.formSubmitted() && (this.confirmPassword !== this.newPassword || !this.confirmPassword);
  }

  submit() {

    this.formSubmitted.set(true);

    if (!this.token) return;

    if (this.newPasswordInvalid || this.confirmPasswordInvalid) return;

    this.error.set('');
    this.loading.set(true);

    this.http.post(
      `${environment.apiUrl}/auth/reset-password`,
      { token: this.token, newPassword: this.newPassword },
      { responseType: 'text' }
    ).subscribe({

      next: () => {

        this.success.set(true);
        this.loading.set(false);

        setTimeout(() => this.router.navigate(['/auth/login']), 3000);

      },

      error: () => {

        this.error.set('Reset failed. Your link may be expired — request a new one.');

        this.loading.set(false);

      }

    });

  }

}