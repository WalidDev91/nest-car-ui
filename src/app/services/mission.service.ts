import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Mission } from '../models/mission';

@Injectable({
  providedIn: 'root',
})
export class MissionService {


  private baseUrl = `${environment.apiUrl}/missions`;


  constructor(
    private http: HttpClient
  ) { }



  getById(id: string) {

    return this.http.get<Mission>(
      `${this.baseUrl}/${id}`
    );

  }



  getAll() {

    return this.http.get<Mission[]>(
      this.baseUrl
    );

  }



  getByVehicleId(vehicleId: string) {

    return this.http.get<Mission[]>(
      `${this.baseUrl}/vehicle/${vehicleId}`
    );

  }



  create(data: any) {

    return this.http.post<Mission>(
      this.baseUrl,
      data
    );

  }



  update(id: string, request: any) {

    return this.http.put<Mission>(
      `${this.baseUrl}/${id}`,
      request
    );

  }



  delete(id: string) {

    return this.http.delete(
      `${this.baseUrl}/${id}`
    );

  }

}