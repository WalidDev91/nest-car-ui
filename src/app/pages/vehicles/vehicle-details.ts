import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'app-vehicle-details',
  imports: [CommonModule],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.css',
})
export class VehicleDetails implements OnInit {

  vehicle = signal<Vehicle | null>(null);

  selectedTab = signal<'info' | 'documents' | 'missions'>('info');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.vehicleService.getById(id).subscribe({
      next: (vehicle) => {
        this.vehicle.set(vehicle);
        setTimeout(() => feather.replace(), 0);
      },
      error: (err) => console.error(err)
    });

  }

  selectTab(tab: 'info' | 'documents' | 'missions') {
    this.selectedTab.set(tab);
    setTimeout(() => feather.replace(), 0);
  }

  editVehicle() {
    console.log('Edit vehicle');
  }

  deleteVehicle() {

    const vehicle = this.vehicle();

    if (!vehicle) return;

    if (!confirm('Delete this vehicle?')) return;

    this.vehicleService.delete(vehicle.id).subscribe({
      next: () => this.router.navigate(['/vehicles']),
      error: (err) => console.error(err)
    });

  }

}
