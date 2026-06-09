import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  register() {
    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password
    }).subscribe({
      next: (response: any) => {

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);

        console.log('Registration success:', response);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Registration failed:', err);
      }
    });
  }
}