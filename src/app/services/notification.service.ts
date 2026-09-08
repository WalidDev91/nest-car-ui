import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  constructor(
    private http: HttpClient
  ) { }

  getAll() {

    return this.http.get<Notification[]>(
      this.baseUrl
    );

  }

  getUnreadCount() {

    return this.http.get<number>(
      `${this.baseUrl}/unread-count`
    );

  }

  markAsRead(id: string) {

    return this.http.patch<void>(
      `${this.baseUrl}/${id}/read`,
      {}
    );

  }

  markAllAsRead() {

    return this.http.patch<void>(
      `${this.baseUrl}/read-all`,
      {}
    );

  }

}