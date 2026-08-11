import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

interface CountryOption {
  code: string;
  flag: string;
  name: string;
}

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
  phoneNumber = '';
  password = '';
  confirmPassword = '';

  countries: CountryOption[] = [
    { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
    { code: '+213', flag: '🇩🇿', name: 'Algeria' },
    { code: '+212', flag: '🇲🇦', name: 'Morocco' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
  ];

  selectedCountryCode = '+216';

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  imageError = '';

  loading = signal(false);
  error = signal('');
  submitted = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // ==========================================================
  // VALIDATION
  // ==========================================================

  get firstNameInvalid(): boolean {
    return this.submitted() && !this.firstName.trim();
  }

  get lastNameInvalid(): boolean {
    return this.submitted() && !this.lastName.trim();
  }

  get emailInvalid(): boolean {

    if (!this.submitted()) return false;

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return !pattern.test(this.email.trim());

  }

  get phoneInvalid(): boolean {

    if (!this.submitted()) return false;

    if (!this.phoneNumber.trim()) return false; // phone stays optional

    return !/^\d{6,14}$/.test(this.phoneNumber.trim());

  }

  get passwordInvalid(): boolean {
    return this.submitted() && this.password.length < 6;
  }

  get confirmPasswordInvalid(): boolean {
    return this.submitted() && (this.confirmPassword !== this.password || !this.confirmPassword);
  }

  get formInvalid(): boolean {

    return (
      this.firstNameInvalid ||
      this.lastNameInvalid ||
      this.emailInvalid ||
      this.phoneInvalid ||
      this.passwordInvalid ||
      this.confirmPasswordInvalid
    );

  }

  // ==========================================================
  // IMAGE
  // ==========================================================

  onImageSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const allowed = ['image/png', 'image/jpeg'];

    if (!allowed.includes(file.type)) {
      this.imageError = 'Photo must be a PNG or JPEG image.';
      return;
    }

    if (file.size > 5_000_000) {
      this.imageError = 'Photo must be under 5MB.';
      return;
    }

    this.imageError = '';
    this.selectedImage = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);

  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  register() {

    this.submitted.set(true);
    this.error.set('');

    if (this.formInvalid) return;

    this.loading.set(true);

    const phone = this.phoneNumber.trim()
      ? `${this.selectedCountryCode}${this.phoneNumber.trim()}`
      : '';

    this.authService.register(
      {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        phone,
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
        localStorage.setItem('imageUrl', response.imageUrl ?? '');

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