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
}
