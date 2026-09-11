import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';
  otpCode = '';

  loading = signal(false);
  otpLoading = signal(false);
  resendLoading = signal(false);

  error = signal('');
  otpError = signal('');

  submitted = signal(false);
  showOtpModal = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  get emailInvalid(): boolean {
    return this.submitted() && !this.email.trim();
  }

  get passwordInvalid(): boolean {
    return this.submitted() && !this.password;
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  login() {

    this.submitted.set(true);
    this.error.set('');

    if (this.emailInvalid || this.passwordInvalid) {
      return;
    }

    this.loading.set(true);

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (response) => {

        this.loading.set(false);

        // Backend authenticated email/password
        // and sent the OTP through TextBee.
        if (response.requiresOtp) {

          this.otpCode = '';
          this.otpError.set('');

          this.showOtpModal.set(true);

          setTimeout(() => {

            const modalElement =
              document.getElementById('otpModal');

            if (!modalElement) {
              return;
            }

            const modal = new bootstrap.Modal(
              modalElement
            );

            modal.show();

          }, 0);

        }

      },

      error: (err) => {

        console.error('Login failed:', err);

        this.error.set('Invalid email or password.');

        this.loading.set(false);

      }

    });

  }

  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  verifyOtp() {

    this.otpError.set('');

    if (!this.otpCode.trim()) {

      this.otpError.set(
        'Please enter the SMS code.'
      );

      return;
    }

    this.otpLoading.set(true);

    this.authService.verifyOtp({
      email: this.email,
      code: this.otpCode
    }).subscribe({

      next: (response: any) => {

        this.otpLoading.set(false);

        // Important:
        // Remove the Bootstrap modal backdrop before
        // navigating to the dashboard.
        this.cleanupOtpModal();

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);
        localStorage.setItem('firstName', response.firstName);
        localStorage.setItem('lastName', response.lastName);
        localStorage.setItem('userId', response.id);
        localStorage.setItem(
          'imageUrl',
          response.imageUrl ?? ''
        );

        this.themeService.reloadForCurrentUser();

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        console.error(
          'OTP verification failed:',
          err
        );

        this.otpError.set(
          'Invalid or expired code.'
        );

        this.otpLoading.set(false);

      }

    });

  }

  // ==========================================================
  // RESEND OTP
  // ==========================================================

  resendOtp() {

    this.otpError.set('');
    this.resendLoading.set(true);

    this.authService.resendOtp(this.email).subscribe({

      next: () => {

        this.resendLoading.set(false);
        this.otpCode = '';

      },

      error: (err) => {

        console.error('Resend OTP failed:', err);

        // SMS may still have been sent successfully even if
        // Angular cannot parse the backend response.
        this.resendLoading.set(false);
        this.otpCode = '';
        this.otpError.set('');

      }

    });

  }

  // ==========================================================
  // CLOSE OTP MODAL
  // ==========================================================

  closeOtpModal() {

    this.cleanupOtpModal();

    this.showOtpModal.set(false);
    this.otpCode = '';
    this.otpError.set('');
    this.otpLoading.set(false);
    this.resendLoading.set(false);

  }

  // ==========================================================
  // BOOTSTRAP MODAL CLEANUP
  // ==========================================================

  private cleanupOtpModal(): void {

    const modalElement =
      document.getElementById('otpModal');

    if (modalElement) {

      bootstrap.Modal
        .getInstance(modalElement)
        ?.hide();

    }

    // Remove any leftover Bootstrap backdrop.
    document
      .querySelectorAll('.modal-backdrop')
      .forEach(backdrop => {
        backdrop.remove();
      });

    // Restore the page after modal closes.
    document.body.classList.remove('modal-open');

    document.body.style.removeProperty('overflow');

    document.body.style.removeProperty(
      'padding-right'
    );

  }

}
