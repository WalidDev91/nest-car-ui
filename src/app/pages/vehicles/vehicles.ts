import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Vehicle } from '../../services/vehicle';


@Component({
  selector: 'app-vehicles',
  imports: [],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {

  constructor(private vehicle: Vehicle) {}

  ngOnInit() {
    this.vehicle.getAll().subscribe({
      next: (data) => {
        console.log('Vehicles from backend:', data);
      },
      error: (err) => {
        console.error('Vehicle error:', err);
      }
    });
  }
}
