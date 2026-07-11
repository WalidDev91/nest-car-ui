import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {
  
private baseUrl = `${environment.apiUrl}/administration`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================
  // ACCOUNT REQUESTS
  // ==========================

  getPendingRequests() {

    return this.http.get<User[]>(
      `${this.baseUrl}/requests`
    );

  }

  approveRequest(userId: string) {

    return this.http.patch<void>(
      `${this.baseUrl}/requests/${userId}/approve`,
      {}
    );

  }

  rejectRequest(userId: string) {

    return this.http.patch<void>(
      `${this.baseUrl}/requests/${userId}/reject`,
      {}
    );

  }

  // ==========================
  // AUDIT LOGS
  // ==========================

  getAuditLogs() {

    return this.http.get<any[]>(
      `${this.baseUrl}/audit`
    );

  }

  // ==========================
  // SETTINGS
  // ==========================

  getSettings() {

    return this.http.get<any>(
      `${this.baseUrl}/settings`
    );

  }

  saveSettings(settings: any) {

    return this.http.put(
      `${this.baseUrl}/settings`,
      settings
    );

  }

}
