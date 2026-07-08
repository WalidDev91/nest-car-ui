import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Mission } from '../models/mission';

@Injectable({
  providedIn: 'root',
})
export class MissionService {

  private baseUrl = `${environment.apiUrl}/missions`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Mission[]>(this.baseUrl);
  }

  create(data: any) {
    return this.http.post<Mission>(this.baseUrl, data);
  }

  update(id: string, data: any) {
    return this.http.put<Mission>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}