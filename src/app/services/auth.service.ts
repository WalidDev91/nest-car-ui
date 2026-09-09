import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ThemeService } from './theme.service';
import { LoginOtpResponse } from '../models/login-otp-response';
import { VerifyOtpRequest } from '../models/verify-otp-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) { }

  login(credentials: any) {
    return this.http.post<LoginOtpResponse>(
      `${this.baseUrl}/login`,
      credentials
    );
  }

  verifyOtp(request: VerifyOtpRequest) {
    return this.http.post(
      `${this.baseUrl}/verify-otp`,
      request
    );
  }

  resendOtp(email: string) {
    return this.http.post(
      `${this.baseUrl}/resend-otp?email=${encodeURIComponent(email)}`,
      {}
    );
  }

  register(userData: any, image: File | null) {

    const formData = new FormData();

    formData.append(
      'user',
      new Blob([JSON.stringify(userData)], { type: 'application/json' })
    );

    if (image) {
      formData.append('image', image);
    }

    return this.http.post(`${this.baseUrl}/register`, formData);
  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('userId');
    localStorage.removeItem('imageUrl');

    this.themeService.reloadForCurrentUser();
  }
}