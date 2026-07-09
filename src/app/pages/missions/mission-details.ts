import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';

@Component({
  selector: 'app-mission-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-details.html',
  styleUrl: './mission-details.css',
})
export class MissionDetails implements OnInit {

  mission = signal<Mission | null>(null);

  selectedTab = signal<
    'info' | 'assignment' | 'inspection'
  >('info');


  driverId = '';
  vehicleId = '';


  constructor(
    private route: ActivatedRoute,
    private missionService: MissionService,
    private router: Router
  ) { }


  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;


    this.missionService.getById(id)
      .subscribe({

        next: (data) => {

          this.mission.set(data);

          this.driverId = data.driverId ?? '';
          this.vehicleId = data.vehicleId ?? '';

        },

        error: (err) => {
          console.error(err);
        }

      });

  }



  selectTab(
    tab: 'info' | 'assignment' | 'inspection'
  ) {

    this.selectedTab.set(tab);

  }



  updateAssignment() {

    const request = {
      title: this.mission()!.title,
      description: this.mission()!.description,
      startDate: this.mission()!.startDate,
      endDate: this.mission()!.endDate,
      status: this.mission()!.status,
      driverId: this.driverId || null,
      vehicleId: this.vehicleId || null
    };

    this.missionService.update(this.mission()!.id, request).subscribe({
      next: (mission) => {
        this.mission.set(mission);
        this.driverId = mission.driverId ?? '';
        this.vehicleId = mission.vehicleId ?? '';
        alert('Assignment updated successfully.');
      },
      error: (err) => console.error(err)
    });

  }

  removeAssignment() {

    const request = {
      title: this.mission()!.title,
      description: this.mission()!.description,
      startDate: this.mission()!.startDate,
      endDate: this.mission()!.endDate,
      status: this.mission()!.status,
      driverId: null,
      vehicleId: null
    };

    this.missionService.update(this.mission()!.id, request).subscribe({
      next: (mission) => {
        this.mission.set(mission);
        this.driverId = '';
        this.vehicleId = '';
        alert('Assignment removed.');
      },
      error: (err) => console.error(err)
    });

  }




  deleteMission() {

    const current = this.mission();

    if (!current) return;


    if (confirm('Delete this mission ?')) {

      this.missionService.delete(current.id)
        .subscribe({

          next: () => {

            this.router.navigate(['/missions']);

          },

          error: err => console.error(err)

        });

    }

  }


}
