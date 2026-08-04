import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Mission } from '../models/mission';


@Injectable({
  providedIn: 'root',
})
export class MissionService {


  private baseUrl = `${environment.apiUrl}/missions`;
  private serverUrl = environment.apiUrl.replace('/api', '');


  constructor(
    private http: HttpClient
  ) { }



  // ==========================================================
  // BASIC CRUD
  // ==========================================================


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



  update(
    id: string,
    request: any
  ) {

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




  // ==========================================================
  // DOCUMENT VERIFICATION
  // ==========================================================


  verifyDocuments(id: string) {
    return this.http.patch<Mission>(
      `${this.baseUrl}/${id}/verification`,
      {}
    );
  }





  // ==========================================================
  // VEHICLE INSPECTION
  // ==========================================================


  saveVehicleInspection(
    id: string,
    request: any
  ) {
    return this.http.post<Mission>(
      `${this.baseUrl}/${id}/inspection`,
      request
    );
  }





  // ==========================================================
  // MISSION PHOTOS
  // ==========================================================


  uploadInspectionPhoto(
    missionId: string,
    file: File,
    description?: string
  ) {

    const formData = new FormData();

    formData.append('file', file);

    if (description) {
      formData.append('description', description);
    }

    return this.http.post<Mission>(
      `${this.baseUrl}/${missionId}/inspection/photos`,
      formData
    );
  }

  deleteInspection(missionId: string) {

    return this.http.delete<Mission>(
      `${this.baseUrl}/${missionId}/inspection`
    );

  }





  deleteInspectionPhoto(
    missionId: string,
    photoId: string
  ) {

    return this.http.delete<Mission>(
      `${this.baseUrl}/${missionId}/inspection/photos/${photoId}`
    );

  }



  // ==========================================================
  // ASSIGNMENT
  // ==========================================================

  assignMission(missionId: string, request: any) {
    return this.http.patch<Mission>(
      `${this.baseUrl}/${missionId}/assignment`,
      request
    );
  }


  getPhotoUrl(url: string): string {

    if (!url) return '';

    if (url.startsWith('http')) {
      return url;
    }

    return `${this.serverUrl}${url}`;

  }


}