import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { AppSettings } from '../models/app-settings';
import { AuditLog } from '../models/audit-log';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {

  private baseUrl = `${environment.apiUrl}/administration`;

  constructor(private http: HttpClient) { }

  // ==========================
  // ACCOUNT REQUESTS
  // ==========================

  getPendingRequests() {
    return this.http.get<User[]>(`${this.baseUrl}/requests`);
  }

  approveRequest(userId: string) {
    return this.http.patch<void>(`${this.baseUrl}/requests/${userId}/approve`, {});
  }

  rejectRequest(userId: string) {
    return this.http.patch<void>(`${this.baseUrl}/requests/${userId}/reject`, {});
  }

  // ==========================
  // AUDIT LOGS
  // ==========================

  getAuditLogs() {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit`);
  }

  // ==========================
  // SETTINGS
  // ==========================

  getSettings() {
    return this.http.get<AppSettings>(`${this.baseUrl}/settings`);
  }

  saveSettings(settings: AppSettings) {
    return this.http.put<void>(`${this.baseUrl}/settings`, settings);
  }

}