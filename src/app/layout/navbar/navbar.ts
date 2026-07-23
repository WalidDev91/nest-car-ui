import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  firstName: string = localStorage.getItem('firstName') ?? '';
  lastName: string = localStorage.getItem('lastName') ?? '';
  role: string = (localStorage.getItem('role') ?? '').replace('_', ' ');

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  get initials(): string {
    return (
      (this.firstName.charAt(0) || '') +
      (this.lastName.charAt(0) || '')
    ).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}