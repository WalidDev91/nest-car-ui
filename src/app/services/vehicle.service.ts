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


  // CREATE — plain JSON, no photos bundled in. Backend endpoint
  // only accepts application/json, never multipart.
  create(vehicle: any) {

    return this.http.post<Vehicle>(this.baseUrl, vehicle);

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

  // ==========================================================
  // IMAGE MANAGEMENT
  // ==========================================================

  // Backend controller accepts one file per request
  // (@RequestParam("file") — singular), so this uploads a single
  // photo. Multiple photos are uploaded by calling this once per
  // file from the component, not by batching here.
  uploadPhoto(id: string, file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Vehicle>(
      `${this.baseUrl}/${id}/photos`,
      formData
    );

  }

  deletePhoto(vehicleId: string, photoId: string) {

    return this.http.delete<Vehicle>(
      `${this.baseUrl}/${vehicleId}/photos/${photoId}`
    );

  }

}