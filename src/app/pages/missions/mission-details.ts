import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import feather from 'feather-icons';

import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';
import { Vehicle } from '../../models/vehicle';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { VehicleService } from '../../services/vehicle.service';

declare var bootstrap: any;

@Component({
  selector: 'app-mission-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-details.html',
  styleUrl: './mission-details.css',
})
export class MissionDetails implements OnInit {

  // ==========================================================
  // DATA
  // ==========================================================

  mission = signal<Mission | null>(null);
  drivers = signal<User[]>([]);
  vehicles = signal<Vehicle[]>([]);

  loading = signal(false);

  // ==========================================================
  // TABS
  // ==========================================================

  selectedTab = signal<
    'info'
    | 'assignment'
    | 'documents'
    | 'inspection'
    | 'photos'
  >('info');

  // ==========================================================
  // ASSIGNMENT
  // ==========================================================

  driverId: string | null = null;
  vehicleId: string | null = null;

  // ==========================================================
  // DOCUMENT VERIFICATION
  // ==========================================================

  documentsVerified = signal(false);

  verificationDate = signal<string | null>(null);

  // ==========================================================
  // INSPECTION FORM
  // ==========================================================

  inspectionMileage: number | null = null;

  inspectionFuelLevel: number | null = null;

  inspectionNotes = '';

  // ==========================================================
  // PHOTOS
  // ==========================================================

  selectedPhoto: File | null = null;

  photoPreview: string | null = null;

  // ==========================================================
  // QUICK INFO
  // ==========================================================

  hasInspection = computed(() =>
    !!this.mission()?.vehicleInspection
  );

  totalPhotos = computed(() =>
    this.mission()?.vehicleInspection?.photos.length ?? 0
  );

  totalDocuments = computed(() =>
    this.mission()?.documents?.length ?? 0
  );

  constructor(
    private route: ActivatedRoute,
    private missionService: MissionService,
    private userService: UserService,
    private vehicleService: VehicleService,
    private router: Router
  ) { }

  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.loadMission(id);
    this.loadDrivers();
    this.loadVehicles();

  }

  // ==========================================================
  // LOAD
  // ==========================================================

  loadMission(id: string): void {

    this.loading.set(true);

    this.missionService.getById(id).subscribe({

      next: data => {

        this.mission.set(data);

        this.driverId = data.driverId ?? null;

        this.vehicleId = data.vehicleId ?? null;

        this.documentsVerified.set(
          data.documentsVerified ?? false
        );

        this.verificationDate.set(
          data.documentsVerificationDate ?? null
        );

        if (data.vehicleInspection) {

          this.inspectionMileage = data.vehicleInspection.mileage ?? null;

          this.inspectionFuelLevel = data.vehicleInspection.fuelLevel ?? null;

          this.inspectionNotes = data.vehicleInspection.notes ?? '';

        } else {

          this.inspectionMileage = null;
          this.inspectionFuelLevel = null;
          this.inspectionNotes = '';

        }

        this.loading.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);

        this.loading.set(false);

      }

    });

  }

  loadDrivers(): void {

    this.userService.getAll().subscribe({

      next: users => {

        this.drivers.set(
          users.filter(u => u.role === 'DRIVER')
        );

      }

    });

  }

  loadVehicles(): void {

    this.vehicleService.getAll().subscribe({

      next: vehicles => {

        this.vehicles.set(vehicles);

      }

    });

  }

  refresh(): void {

    const current = this.mission();

    if (!current) return;

    this.loadMission(current.id);

  }

  // ==========================================================
  // TABS
  // ==========================================================

  selectTab(
    tab:
      | 'info'
      | 'assignment'
      | 'documents'
      | 'inspection'
      | 'photos'
  ): void {

    this.selectedTab.set(tab);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // EDIT
  // ==========================================================

  editMission(): void {

    const mission = this.mission();

    if (!mission) return;

    this.router.navigate(
      ['/missions'],
      {
        queryParams: {
          edit: mission.id
        }
      }
    );

  }

  deleteMission(): void {

    const mission = this.mission();

    if (!mission) return;

    this.router.navigate(
      ['/missions'],
      {
        queryParams: {
          delete: mission.id
        }
      }
    );

  }

  // ==========================================================
  // ASSIGNMENT
  // ==========================================================

  updateAssignment(): void {

    const current = this.mission();

    if (!current) return;

    const request = {

      driverId: this.driverId,
      vehicleId: this.vehicleId

    };

    this.missionService
      .assignMission(current.id, request)
      .subscribe({

        next: (updatedMission) => {

          this.mission.set(updatedMission);

          this.driverId = updatedMission.driverId ?? null;

          this.vehicleId = updatedMission.vehicleId ?? null;

        },

        error: (err: any) => console.error(err)

      });

  }

  // ==========================================================
  // DOCUMENT VERIFICATION
  // ==========================================================

  verifyDocuments(): void {

    const current = this.mission();

    if (!current) return;

    this.missionService.verifyDocuments(current.id)
      .subscribe({

        next: data => {

          this.documentsVerified.set(true);

          this.verificationDate.set(
            data.documentsVerificationDate ?? null
          );

        },

        error: (err: any) => console.error(err)

      });

  }

  // ==========================================================
  // INSPECTION
  // ==========================================================

  saveVehicleInspection(): void {

    const current = this.mission();

    if (!current) return;

    const request = {
      mileage: this.inspectionMileage,
      fuelLevel: this.inspectionFuelLevel,
      notes: this.inspectionNotes
    };

    this.missionService.saveVehicleInspection(current.id, request)
      .subscribe({

        next: (updatedMission: Mission) => {

          this.mission.set(updatedMission);

          if (updatedMission.vehicleInspection) {

            this.inspectionMileage =
              updatedMission.vehicleInspection.mileage;

            this.inspectionFuelLevel =
              updatedMission.vehicleInspection.fuelLevel;

            this.inspectionNotes =
              updatedMission.vehicleInspection.notes ?? '';

          }

          const modalEl =
            document.getElementById('inspectionModal');

          if (modalEl) {

            bootstrap.Modal
              .getInstance(modalEl)
              ?.hide();

          }

          this.loadMission(current.id);

          setTimeout(() => feather.replace(), 0);

        },

        error: err => console.error(err)

      });

  }

  // ==========================================================
  // PHOTOS
  // ==========================================================

  onPhotoSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.selectedPhoto = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {

      this.photoPreview = reader.result as string;

    };

    reader.readAsDataURL(this.selectedPhoto);

  }

  uploadInspectionPhoto(): void {

    const current = this.mission();

    if (!current || !this.selectedPhoto) return;

    this.missionService
      .uploadInspectionPhoto(current.id, this.selectedPhoto)
      .subscribe({

        next: () => {

          this.selectedPhoto = null;

          this.photoPreview = null;

          const input = document.getElementById(
            'missionPhotoInput'
          ) as HTMLInputElement;

          if (input) {
            input.value = '';
          }

          this.loadMission(current.id);

          setTimeout(() => feather.replace(), 0);

        },

        error: err => {
          // TODO: Backend should return HTTP 413 for MaxUploadSizeExceededException.
          if (err.status === 403) {

            bootstrap.Modal
              .getOrCreateInstance(
                document.getElementById('photoSizeModal')
              )
              .show();

            return;

          }
          console.error(err);

        }

      });

  }

  deletePhoto(photoId: string): void {

    const current = this.mission();

    if (!current) return;

    this.missionService.deleteInspectionPhoto(current.id, photoId)
      .subscribe({

        next: (updatedMission: Mission) => {

          this.mission.set(updatedMission);

          setTimeout(() => feather.replace(), 0);

        },

        error: (err: any) => console.error(err)

      });

  }

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  viewMissionDocument(documentId: string): void {

    this.router.navigate([
      '/documents',
      documentId
    ]);

  }

  deleteInspection(): void {

    const mission = this.mission();

    if (!mission?.vehicleInspection) return;

    this.missionService
      .deleteInspection(mission.id)
      .subscribe({

        next: () => {

          const modalEl =
            document.getElementById('deleteInspectionModal');

          if (modalEl) {

            bootstrap.Modal
              .getInstance(modalEl)
              ?.hide();

          }

          this.loadMission(mission.id);

          setTimeout(() => feather.replace(), 0);

        },

        error: err => {

          console.error(err);

          alert('Delete failed');

        }

      });

  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  getStatusClass(status: string): string {

    switch (status) {

      case 'ONGOING':
        return 'bg-info';

      case 'COMPLETED':
        return 'bg-success';

      case 'CANCELLED':
        return 'bg-danger';

      default:
        return 'bg-warning';

    }

  }

  photoUrl(url: string): string {
    return this.missionService.getPhotoUrl(url);
  }

  goBack(): void {

    this.router.navigate(['/missions']);

  }

}