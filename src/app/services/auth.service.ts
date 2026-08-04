import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
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
  }
}