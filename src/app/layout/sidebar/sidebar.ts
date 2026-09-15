import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  fullName =
    `${localStorage.getItem('firstName') ?? ''} ${localStorage.getItem('lastName') ?? ''}`;

  role = localStorage.getItem('role') ?? '';

  get canSeeDocuments(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER', 'DRIVER'].includes(this.role);
  }

  get canSeeMissions(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER', 'DRIVER'].includes(this.role);
  }

  get canSeeVehicles(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER', 'DRIVER'].includes(this.role);
  }

  get canSeeDrivers(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'].includes(this.role);
  }

  get canSeeUsers(): boolean {
    return ['SUPER_ADMIN', 'ADMIN'].includes(this.role);
  }

  get canSeeAdministration(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'].includes(this.role);
  }

  get canSeeOperations(): boolean {
    return (
      this.canSeeDocuments ||
      this.canSeeMissions ||
      this.canSeeVehicles ||
      this.canSeeDrivers
    );
  }

  get canSeeManagement(): boolean {
    return this.canSeeUsers || this.canSeeAdministration;
  }
}