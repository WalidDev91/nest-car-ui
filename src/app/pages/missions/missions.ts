import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';
import { Router } from '@angular/router';
import feather from 'feather-icons';

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
    private missionService: MissionService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.loadMissions();
    setTimeout(() => feather.replace(), 0);
  }


  loadMissions() {

    this.missionService.getAll()
      .subscribe({
        next: data => {
          this.missions.set(data);
          setTimeout(() => feather.replace(), 0);
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

  viewMissionDetails(id: string) {
    this.router.navigate(['/missions', id]);
  }

}