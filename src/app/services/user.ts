import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class User {

  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any[]>(this.baseUrl);
  }

  getByRole(role: string) {
    return this.http.get<any[]>(`${this.baseUrl}?role=${role}`);
  }

}
