import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';

@Component({
  selector: 'app-missions',
  imports: [CommonModule, FormsModule],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions implements OnInit {

  missions = signal<Mission[]>([]);

  showModal = false;

  isDriver = localStorage.getItem('role') === 'DRIVER';


  // CREATE FORM

  title = '';
  description = '';

  startDate = '';
  endDate = '';

  status:
    'PLANNED' |
    'ONGOING' |
    'COMPLETED' |
    'CANCELLED' = 'PLANNED';


  driverId = '';
  vehicleId = '';


  constructor(
    private missionService: MissionService
  ) { }


  ngOnInit(): void {
    this.loadMissions();
  }


  loadMissions() {

    this.missionService.getAll()
      .subscribe({
        next: data => {
          this.missions.set(data);
        },
        error: err => {
          console.error(err);
        }
      });

  }


  openCreateModal() {
    this.showModal = true;
  }


  closeCreateModal() {
    this.showModal = false;
  }


  createMission() {

    const mission = {

      title: this.title,

      description: this.description,

      startDate: this.startDate,

      endDate: this.endDate,

      status: this.status,

      driverId: this.driverId || null,

      vehicleId: this.vehicleId || null

    };


    this.missionService.create(mission)
      .subscribe({

        next: () => {

          this.loadMissions();

          this.closeCreateModal();

          this.resetForm();

        },

        error: err => {
          console.error(err);
        }

      });

  }


  resetForm() {

    this.title = '';
    this.description = '';
    this.startDate = '';
    this.endDate = '';

    this.status = 'PLANNED';

    this.driverId = '';
    this.vehicleId = '';

  }

}