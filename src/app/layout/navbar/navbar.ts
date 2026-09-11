import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';

import feather from 'feather-icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy, AfterViewInit {

  firstName: string = localStorage.getItem('firstName') ?? '';
  lastName: string = localStorage.getItem('lastName') ?? '';
  role: string = (localStorage.getItem('role') ?? '').replace('_', ' ');

  // Backend sends a literal "avatar.jpg" placeholder filename for users
  // with no real photo (rather than null) — that file doesn't exist on
  // the server, so it must be treated the same as no avatar at all.
  private readonly placeholderImages = ['avatar.jpg'];

  // ==========================
  // NOTIFICATIONS
  // ==========================

  notifications = signal<Notification[]>([]);

  unreadCount = signal(0);

  private pollingSubscription?: Subscription;

  private readonly pollingIntervalMs = 20000; // 20s

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {

    this.pollingSubscription = interval(this.pollingIntervalMs).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount())
    ).subscribe({

      next: count => {

        this.unreadCount.set(count);

      },

      error: err => console.error('Failed to load unread count', err)

    });

  }

  ngAfterViewInit(): void {

    setTimeout(() => feather.replace(), 0);

  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  loadNotifications(): void {

    this.notificationService.getAll().subscribe({

      next: notifications => {

        this.notifications.set(notifications.slice(0, 15));

        setTimeout(() => feather.replace(), 0);

      },

      error: err => console.error('Failed to load notifications', err)

    });

  }

  onNotificationClick(notification: Notification): void {

    if (!notification.isRead) {

      this.notificationService.markAsRead(notification.id).subscribe({

        next: () => {

          this.notifications.update(items =>
            items.map(n =>
              n.id === notification.id
                ? { ...n, isRead: true }
                : n
            )
          );

          this.unreadCount.update(count => Math.max(0, count - 1));

          setTimeout(() => feather.replace(), 0);

        },

        error: err => console.error('Failed to mark notification as read', err)

      });

    }

    if (notification.link) {
      this.router.navigate([notification.link]);
    }

  }

  markAllAsRead(event: Event): void {

    event.stopPropagation();

    this.notificationService.markAllAsRead().subscribe({

      next: () => {

        this.notifications.update(items =>
          items.map(n => ({ ...n, isRead: true }))
        );

        this.unreadCount.set(0);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => console.error('Failed to mark all as read', err)

    });

  }

  getNotificationIcon(type: string): string {

    switch (type) {
      case 'DOCUMENT_UPLOADED': return 'upload';
      case 'DOCUMENT_APPROVED': return 'check-circle';
      case 'DOCUMENT_REJECTED': return 'x-circle';
      case 'DOCUMENT_EXPIRING_SOON': return 'alert-triangle';
      case 'DOCUMENT_EXPIRED': return 'alert-circle';
      case 'MISSION_ASSIGNED': return 'map';
      case 'VEHICLE_ASSIGNED': return 'truck';
      case 'REQUEST_SUBMITTED': return 'message-square';
      case 'REQUEST_REVIEWED': return 'message-circle';
      default: return 'bell';
    }

  }

  getNotificationColorClass(type: string): string {

    switch (type) {
      case 'DOCUMENT_APPROVED': return 'text-success';
      case 'DOCUMENT_REJECTED': return 'text-danger';
      case 'DOCUMENT_EXPIRING_SOON': return 'text-warning';
      case 'DOCUMENT_EXPIRED': return 'text-danger';
      case 'MISSION_ASSIGNED': return 'text-success';
      case 'VEHICLE_ASSIGNED': return 'text-primary';
      default: return 'text-primary';
    }

  }

  // ==========================
  // EXISTING CODE — unchanged
  // ==========================

  get initials(): string {

    const first = this.firstName.charAt(0).toUpperCase();
    const last = this.lastName.charAt(0).toUpperCase();

    if (!first && !last) return '';
    if (!first) return last;
    if (!last) return first;

    return `${first}.${last}`;

  }

  get hasAvatar(): boolean {

    const value = localStorage.getItem('imageUrl');

    return !!value && !this.placeholderImages.includes(value);

  }

  get avatarUrl(): string {
    return environment.uploadsUrl + '/uploads/users/' + localStorage.getItem('imageUrl');
  }

  isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  // toSvg() returns the icon markup as a string rather than mutating the
  // DOM directly like feather.replace() does — Angular owns the element
  // via [innerHTML] the whole time, so toggling never orphans or piles
  // up icons. Every other (static, never-changing) icon in the app keeps
  // using feather.replace() as normal — this is the one exception.
  get themeIconSvg(): SafeHtml {

    const name = this.isDarkMode() ? 'sun' : 'moon';

    const svg = feather.icons[name].toSvg({ class: 'align-middle feather' });

    return this.sanitizer.bypassSecurityTrustHtml(svg);

  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

}
