import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root',
})
export class UserService {

  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getByRole(role: string) {
    return this.http.get<any[]>(`${this.baseUrl}?role=${role}`);
  }

  activate(id: string) {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/activate`,
      {}
    );

  }


  deactivate(id: string) {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/deactivate`,
      {}
    );

  }


  changeRole(id: string, role: string) {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/role`,
      {
        role: role
      }
    );

  }


  delete(id: string) {

    return this.http.delete<void>(
      `${this.baseUrl}/${id}`
    );

  }

}
