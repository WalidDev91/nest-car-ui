import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserRequest } from '../models/user-request';

@Injectable({
  providedIn: 'root',
})
export class UserRequestService {

  private readonly baseUrl = `${environment.apiUrl}/requests`;

  constructor(
    private http: HttpClient
  ) { }

  // ==========================================================
  // CREATE
  // ==========================================================

  create(request: {
    type: string;
    subject: string;
    description: string;
  }) {

    return this.http.post<UserRequest>(
      this.baseUrl,
      request
    );

  }

  // ==========================================================
  // MY REQUESTS
  // ==========================================================

  getMine() {

    return this.http.get<UserRequest[]>(
      `${this.baseUrl}/mine`
    );

  }

  // ==========================================================
  // VISIBLE TO CURRENT SUPERVISOR/ADMIN
  // ==========================================================

  getVisible() {

    return this.http.get<UserRequest[]>(
      `${this.baseUrl}/visible`
    );

  }

  // ==========================================================
  // REVIEW (supervisor/admin action)
  // ==========================================================

  review(id: string, request: {
    status: string;
    adminResponse: string;
  }) {

    return this.http.patch<UserRequest>(
      `${this.baseUrl}/${id}/review`,
      request
    );

  }

}