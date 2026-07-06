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

  getById(id: string) {
    return this.http.get<MissionDocument>(
      `${this.baseUrl}/${id}`
    );
  }

  getByMissionId(missionId: string) {
    return this.http.get<MissionDocument[]>(
      `${this.baseUrl}/mission/${missionId}`
    );
  }

  upload(
    file: File,
    title: string,
    missionId: string
  ) {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('title', title);
    formData.append('missionId', missionId);

    return this.http.post(
      `${this.baseUrl}/upload`,
      formData
    );
  }

  delete(id: string) {
    return this.http.delete(
      `${this.baseUrl}/${id}`
    );
  }
}