import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})

export class Sidebar {

  role = localStorage.getItem('role');

  get isDriver() {
    return this.role === 'DRIVER';
  }

  get isFleetManager() {
    return this.role === 'FLEET_MANAGER';
  }

  get isAdmin() {
    return this.role === 'ADMIN';
  }

  get isSuperAdmin() {
    return this.role === 'SUPER_ADMIN';
  }
}
