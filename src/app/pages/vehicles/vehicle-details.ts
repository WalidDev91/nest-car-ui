import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionService } from '../../services/mission.service';
import { ToastService } from '../../services/toast.service';

import { Vehicle } from '../../models/vehicle';
import { VehicleDocument } from '../../models/vehicle-document';
import { Mission } from '../../models/mission';

const UPLOADS_BASE = 'http://localhost:8080/uploads/vehicles/';

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

  error = signal('');

  // ==========================================================
  // GALLERY
  // ==========================================================

  selectedPhoto = signal<string | null>(null);

  // Every image tied to this vehicle: the primary imageUrl first,
  // then any additional photos[] once the backend supports them.
  // Nothing here needs to change when that lands — it'll just
  // start returning more than one item.
  allPhotos = computed(() => {

    const v = this.vehicle();

    if (!v) return [];

    const list: string[] = [];

    if (v.imageUrl) list.push(v.imageUrl);

    if (v.photos?.length) list.push(...v.photos);

    return list;

  });

  resolvePhotoUrl(filename: string): string {
    return UPLOADS_BASE + filename;
  }

  selectPhoto(filename: string): void {
    this.selectedPhoto.set(this.resolvePhotoUrl(filename));
  }

  onAddPhotoClick(): void {
    this.toastService.info('Multiple photo uploads will be available once backend support is added.');
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  hasInsurance = signal(false);
  hasLicense = signal(false);
  hasTechnicalCheck = signal(false);

  // Availability — date-based, identical logic to the Vehicles
  // list page: a vehicle is "in mission" only while now() falls
  // between an assigned mission's startDate and endDate.
  isInMission = computed(() => {

    const now = new Date();

    return this.missions().some(m => {

      if (!m.startDate || !m.endDate) return false;

      const start = new Date(m.startDate);
      const end = new Date(m.endDate);

      return now >= start && now <= end;

    });

  });

  // ==========================================================
  // TABS
  // ==========================================================

  selectedTab = signal<'info' | 'documents' | 'missions'>('info');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private vehicleDocumentService: VehicleDocumentService,
    private missionService: MissionService,
    private toastService: ToastService
  ) { }

  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Invalid vehicle id');
      return;
    }

    this.loadVehicle(id);

  }

  // ==========================================================
  // LOAD VEHICLE
  // ==========================================================

  loadVehicle(id: string) {

    this.loading.set(true);
    this.error.set('');

    this.vehicleService.getById(id).subscribe({

      next: vehicle => {

        this.vehicle.set(vehicle);

        this.selectedPhoto.set(
          vehicle.imageUrl ? this.resolvePhotoUrl(vehicle.imageUrl) : null
        );

        this.loading.set(false);

        this.loadDocuments(vehicle.id);

        this.loadMissions(vehicle.id);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.error.set('Unable to load vehicle information.');

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

        this.hasLicense.set(docs.some(d => d.type === 'LICENSE'));

        this.hasInsurance.set(docs.some(d => d.type === 'INSURANCE'));

        this.hasTechnicalCheck.set(docs.some(d => d.type === 'TECHNICAL_CHECK'));

      },

      error: err => {
        console.error(err);
        this.toastService.error('Failed to load vehicle documents');
      }

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

      error: err => {
        console.error(err);
        this.toastService.error('Failed to load vehicle missions');
      }

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

  goBack() {
    this.router.navigate(['/vehicles']);
  }

  editVehicle(): void {

    const vehicle = this.vehicle();

    if (!vehicle) return;

    this.router.navigate(['/vehicles'], { queryParams: { edit: vehicle.id } });

  }

  deleteVehicle(): void {

    const vehicle = this.vehicle();

    if (!vehicle) return;

    this.router.navigate(['/vehicles'], { queryParams: { delete: vehicle.id } });

  }

  viewVehicleDocument(id: string) {
    this.router.navigate(['/documents/vehicle', id]);
  }

  viewMissionDetails(id: string): void {
    this.router.navigate(['/missions', id]);
  }

}