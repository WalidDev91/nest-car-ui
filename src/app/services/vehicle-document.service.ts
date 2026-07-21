import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { VehicleDocument } from '../models/vehicle-document';


@Injectable({
  providedIn: 'root',
})
export class VehicleDocumentService {


  private baseUrl = `${environment.apiUrl}/vehicle-documents`;



  constructor(
    private http: HttpClient
  ) { }




  getAll() {

    return this.http.get<VehicleDocument[]>(
      this.baseUrl
    );

  }




  getById(id: string) {

    return this.http.get<VehicleDocument>(
      `${this.baseUrl}/${id}`
    );

  }




  getByVehicleId(vehicleId: string) {

    return this.http.get<VehicleDocument[]>(
      `${this.baseUrl}/vehicle/${vehicleId}`
    );

  }




  upload(
    file: File,
    title: string,
    type: string,
    year: number,
    vehicleId: string
  ) {

    const formData = new FormData();


    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    formData.append('year', year.toString());
    formData.append('vehicleId', vehicleId);



    return this.http.post<VehicleDocument>(
      `${this.baseUrl}/upload`,
      formData
    );

  }





  delete(id: string) {

    return this.http.delete(
      `${this.baseUrl}/${id}`
    );

  }





  download(id: string) {

  return this.http.get(
    `${this.baseUrl}/${id}/download`,
    {
      observe:'response',
      responseType:'blob'
    }
  );

}



}