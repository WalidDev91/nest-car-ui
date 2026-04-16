import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Api } from '../../services/api';


@Component({
  selector: 'app-drivers',
  imports: [],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
})
export class Drivers implements OnInit {

  drivers: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.api.getDrivers().subscribe({
      next: (data) => {
        console.log('Drivers from backend:', data);
        this.drivers = data;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
}
