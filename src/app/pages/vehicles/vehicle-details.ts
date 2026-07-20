import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionService } from '../../services/mission.service';

import { Vehicle } from '../../models/vehicle';
import { VehicleDocument } from '../../models/vehicle-document';
import { Mission } from '../../models/mission';

@Component({
  selector: 'app-vehicle-details',
  imports: [CommonModule],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.css',
})
export class VehicleDetails implements OnInit {

  // ==========================================================
  // DATA
  // ==========================================================

  vehicle = signal<Vehicle | null>(null);

  documents = signal<VehicleDocument[]>([]);
  missions = signal<Mission[]>([]);

  loading = signal(false);

  // ==========================================================
  // STATUS
  // ==========================================================

  hasInsurance = signal(false);
  hasLicense = signal(false);
  hasTechnicalCheck = signal(false);





  // ==========================================================
  // TABS
  // ==========================================================

  selectedTab = signal<'info' | 'documents' | 'missions'>('info');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private vehicleDocumentService: VehicleDocumentService,
    private missionService: MissionService
  ) { }

  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.loadVehicle(id);

  }

  // ==========================================================
  // LOAD VEHICLE
  // ==========================================================

  loadVehicle(id: string) {

    this.loading.set(true);

    this.vehicleService.getById(id).subscribe({

      next: vehicle => {

        this.vehicle.set(vehicle);

        this.loading.set(false);

        this.loadDocuments(vehicle.id);

        this.loadMissions(vehicle.id);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.loading.set(false);

      }

    });

  }

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  loadDocuments(vehicleId: string) {

    this.vehicleDocumentService.getByVehicleId(vehicleId).subscribe({

      next: docs => {

        this.documents.set(docs);


        this.hasLicense.set(

          docs.some(d => d.type === 'LICENSE')

        );


        this.hasInsurance.set(

          docs.some(d => d.type === 'INSURANCE')

        );


        this.hasTechnicalCheck.set(

          docs.some(d => d.type === 'TECHNICAL_CHECK')

        );


      },

      error: err => console.error(err)

    });

  }

  // ==========================================================
  // MISSIONS
  // ==========================================================

  loadMissions(vehicleId: string) {

    this.missionService.getByVehicleId(vehicleId).subscribe({

      next: missions => {

        this.missions.set(missions);

      },

      error: err => console.error(err)

    });

  }

  // ==========================================================
  // TABS
  // ==========================================================

  selectTab(tab: 'info' | 'documents' | 'missions') {

    this.selectedTab.set(tab);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // ACTIONS
  // ==========================================================

  refresh() {

    const vehicle = this.vehicle();

    if (!vehicle) return;

    this.loadVehicle(vehicle.id);

  }

  goBack(){

  this.router.navigate(['/vehicles']);

}

  editVehicle() {

    const vehicle = this.vehicle();

    if (!vehicle) return;

    console.log('Edit vehicle', vehicle.id);

    // backend later

  }

  deleteVehicle() {

    const vehicle = this.vehicle();

    if (!vehicle) return;

    if (!confirm('Delete this vehicle ?')) return;

    this.vehicleService.delete(vehicle.id).subscribe({

      next: () => {

        this.router.navigate(['/vehicles']);

      },

      error: err => console.error(err)

    });

  }


}