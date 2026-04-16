import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDrivers() {
    return this.http.get<any[]>(`${this.baseUrl}/drivers`);
  }

  getVehicles() {
    return this.http.get<any[]>(`${this.baseUrl}/vehicles`);
  }
}
