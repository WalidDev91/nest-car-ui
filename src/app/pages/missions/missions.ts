import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';

@Component({
  selector: 'app-missions',
  imports: [CommonModule],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions implements OnInit {

  missions = signal<Mission[]>([]);

  constructor(private missionService: MissionService) { }

  ngOnInit(): void {
    this.missionService.getAll().subscribe({
      next: (data) => {
        this.missions.set(data);
      },
      error: (err) => {
        console.error('Mission error:', err);
      }
    });
  }
}
