import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Vehicle } from '../models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {

  private baseUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Vehicle[]>(this.baseUrl);
  }

}
