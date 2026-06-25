import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DriverDocument } from '../models/driver-document';

@Injectable({
  providedIn: 'root',
})
export class DriverDocumentService {
  private baseUrl = `${environment.apiUrl}/driver-documents`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<DriverDocument[]>(this.baseUrl);
  }

  upload(file: File, title: string, type: string, driverId: string) {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('title', title);
  formData.append('type', type);
  formData.append('driverId', driverId);

  return this.http.post(
    `${this.baseUrl}/upload`,
    formData
  );
}
}
