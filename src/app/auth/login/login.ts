import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';

  loading = signal(false);
  error = signal('');
  submitted = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  get emailInvalid(): boolean {
    return this.submitted() && !this.email.trim();
  }

  get passwordInvalid(): boolean {
    return this.submitted() && !this.password;
  }

  login() {

    this.submitted.set(true);
    this.error.set('');

    if (this.emailInvalid || this.passwordInvalid) return;

    this.loading.set(true);

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (response: any) => {

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);
        localStorage.setItem('firstName', response.firstName);
        localStorage.setItem('lastName', response.lastName);
        localStorage.setItem('userId', response.id);
        localStorage.setItem('imageUrl', response.imageUrl ?? '');

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        console.error('Login failed:', err);

        this.error.set('Invalid email or password.');

        this.loading.set(false);

      }

    });

  }

}