import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {

  private baseUrl = `${environment.apiUrl}/administration`;

  constructor(private http: HttpClient) { }

  // ==========================
  // AUDIT LOGS (kept for future use — commented out in UI)
  // ==========================

  // getAuditLogs() {
  //   return this.http.get<AuditLog[]>(`${this.baseUrl}/audit`);
  // }

}