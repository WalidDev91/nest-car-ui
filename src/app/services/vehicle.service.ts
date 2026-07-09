import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Vehicle } from '../models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {

  private baseUrl = `${environment.apiUrl}/vehicles`;

  constructor(
    private http: HttpClient
  ) { }


  // GET ALL
  getAll() {

    return this.http.get<Vehicle[]>(this.baseUrl);

  }


  // GET BY ID (details page)
  getById(id: string) {

    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);

  }


  // CREATE
  create(vehicle: any) {

    return this.http.post<Vehicle>(
      this.baseUrl,
      vehicle
    );

  }


  // UPDATE
  update(id: string, vehicle: any) {

    return this.http.put<Vehicle>(
      `${this.baseUrl}/${id}`,
      vehicle
    );

  }


  // DELETE
  delete(id: string) {

    return this.http.delete<void>(
      `${this.baseUrl}/${id}`
    );

  }

}