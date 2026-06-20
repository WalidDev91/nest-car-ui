import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MissionDocument } from '../models/mission-document';

@Injectable({
  providedIn: 'root',
})
export class MissionDocumentService {
  private baseUrl = `${environment.apiUrl}/mission-documents`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<MissionDocument[]>(this.baseUrl);
  }
}
