import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Vehicle {

  private baseUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any[]>(this.baseUrl);
  }

}
