import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DriverDocument } from '../models/driver-document';

@Injectable({
  providedIn: 'root',
})
export class DriverDocumentService {

  private baseUrl = `${environment.apiUrl}/driver-documents`;


  constructor(
    private http: HttpClient
  ) { }



  getAll() {

    return this.http.get<DriverDocument[]>(this.baseUrl);

  }



  getById(id: string) {

    return this.http.get<DriverDocument>(
      `${this.baseUrl}/${id}`
    );

  }



  getByDriverId(driverId: string) {

    return this.http.get<DriverDocument[]>(
      `${this.baseUrl}/driver/${driverId}`
    );

  }



  upload(
    file: File,
    title: string,
    type: string,
    driverId: string
  ) {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    formData.append('driverId', driverId);


    return this.http.post<DriverDocument>(
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
        observe: 'response',
        responseType: 'blob'
      }
    );

  }

  previewDriverDocument(id: string) {

    return this.http.get(
      `${this.baseUrl}/${id}/preview`,
      {
        responseType: 'blob'
      }
    );

  }

  updateDriverDocumentStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'PENDING'
  ) {

    return this.http.patch<DriverDocument>(
      `${this.baseUrl}/${id}/status`,
      {
        status
      }
    );

  }

  update(
    id: string,
    request: {
      title: string;
      type: string;
    }
  ) {

    return this.http.put<DriverDocument>(
      `${this.baseUrl}/${id}`,
      request
    );

  }

  deleteDriverDocument(id: string) {

    return this.http.delete(
      `${this.baseUrl}/${id}`
    );

  }


}