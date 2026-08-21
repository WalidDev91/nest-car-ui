import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import feather from 'feather-icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  firstName: string = localStorage.getItem('firstName') ?? '';
  lastName: string = localStorage.getItem('lastName') ?? '';
  role: string = (localStorage.getItem('role') ?? '').replace('_', ' ');

  // Backend sends a literal "avatar.jpg" placeholder filename for users
  // with no real photo (rather than null) — that file doesn't exist on
  // the server, so it must be treated the same as no avatar at all.
  private readonly placeholderImages = ['avatar.jpg'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService
  ) { }

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
    this.router.navigate(['/login']);
  }

}