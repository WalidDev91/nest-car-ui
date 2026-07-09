import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';


@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {

  vehicles = signal<Vehicle[]>([]);

  // CREATE FORM

  plateNumber = '';
  brand = '';
  model = '';
  year = new Date().getFullYear();


  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.loadVehicles();
  }


  loadVehicles() {

    this.vehicleService.getAll().subscribe({

      next: (data) => {

        this.vehicles.set(data);

        setTimeout(() => feather.replace(), 0);

      },

      error: (err) => {

        console.error('Vehicle error:', err);

      }

    });

  }



  createVehicle() {

    const vehicle = {

      plateNumber: this.plateNumber,

      brand: this.brand,

      model: this.model,

      year: this.year

    };


    this.vehicleService.create(vehicle)
      .subscribe({

        next: () => {

          this.loadVehicles();

          this.resetForm();


        },

        error: (err) => {

          console.error('Create vehicle error:', err);

        }

      });

  }



  resetForm() {

    this.plateNumber = '';

    this.brand = '';

    this.model = '';

    this.year = new Date().getFullYear();

  }



  viewVehicleDetails(id: string) {

    this.router.navigate(['/vehicles', id]);

  }

}