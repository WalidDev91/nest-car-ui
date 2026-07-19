import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';



@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient
  ) { }

  // ==========================================================
  // GET
  // ==========================================================

  getAll(): Observable<User[]> {

    return this.http.get<User[]>(this.baseUrl);

  }

  getById(id: string): Observable<User> {

    return this.http.get<User>(`${this.baseUrl}/${id}`);

  }

  getByRole(role: string): Observable<User[]> {

    return this.http.get<User[]>(`${this.baseUrl}?role=${role}`);

  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  update(id: string, user: Partial<User>): Observable<User> {

    return this.http.put<User>(
      `${this.baseUrl}/${id}`,
      user
    );

  }

  // ==========================================================
  // ACTIVATE
  // ==========================================================

  activate(id: string): Observable<void> {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/activate`,
      {}
    );

  }

  // ==========================================================
  // DEACTIVATE
  // ==========================================================

  deactivate(id: string): Observable<void> {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/deactivate`,
      {}
    );

  }

  // ==========================================================
  // CHANGE ROLE
  // ==========================================================

  changeRole(id: string, role: string): Observable<void> {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/role`,
      {
        role
      }
    );

  }

  // ==========================================================
  // DELETE
  // ==========================================================

  delete(id: string): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/${id}`
    );

  }

}