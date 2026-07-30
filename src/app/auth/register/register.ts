import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onImageSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowed = ['image/png', 'image/jpeg'];

    if (!allowed.includes(file.type)) {
      this.error.set('Profile picture must be a PNG or JPEG image.');
      return;
    }

    if (file.size > 5_000_000) {
      this.error.set('Profile picture must be under 5MB.');
      return;
    }

    this.error.set('');
    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);

  }

  register() {

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register(
      {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        password: this.password
      },
      this.selectedImage
    ).subscribe({

      next: (response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);
        localStorage.setItem('firstName', response.firstName);
        localStorage.setItem('lastName', response.lastName);
        localStorage.setItem('userId', response.id);
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        console.error('Registration failed:', err);
        this.error.set('Registration failed. Email may already exist.');
        this.loading.set(false);
      }

    });

  }

}