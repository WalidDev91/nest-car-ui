import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';


@Component({
  selector: 'app-vehicles',
  imports: [CommonModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {

  vehicles = signal<Vehicle[]>([]);

  constructor(private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {
    this.vehicleService.getAll().subscribe({
      next: (data) => {
        this.vehicles.set(data);
      },
      error: (err) => {
        console.error('Vehicle error:', err);
      }
    });
  }
}