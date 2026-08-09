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
import { MissionDocumentService } from '../../services/mission-document.service';
import { ToastService } from '../../services/toast.service';

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
    'info' | 'assignment' | 'documents' | 'inspection' | 'photos'
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

  selectedValidationStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'APPROVED';

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

  photoToDeleteId = signal<string | null>(null);

  // ==========================================================
  // QUICK INFO
  // ==========================================================

  hasInspection = computed(() => !!this.mission()?.vehicleInspection);

  totalPhotos = computed(() =>
    this.mission()?.vehicleInspection?.photos.length ?? 0
  );

  totalDocuments = computed(() => this.mission()?.documents?.length ?? 0);

  constructor(
    private route: ActivatedRoute,
    private missionService: MissionService,
    private userService: UserService,
    private vehicleService: VehicleService,
    private missionDocumentService: MissionDocumentService,
    private toastService: ToastService,
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

        this.documentsVerified.set(data.documentsVerified ?? false);
        this.verificationDate.set(data.documentsVerificationDate ?? null);

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

        this.toastService.error('Failed to load mission');

      }

    });

  }

  loadDrivers(): void {

    this.userService.getAll().subscribe({
      next: users => this.drivers.set(users.filter(u => u.role === 'DRIVER'))
    });

  }

  loadVehicles(): void {

    this.vehicleService.getAll().subscribe({
      next: vehicles => this.vehicles.set(vehicles)
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

  selectTab(tab: 'info' | 'assignment' | 'documents' | 'inspection' | 'photos'): void {

    this.selectedTab.set(tab);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // EDIT / DELETE MISSION
  // ==========================================================

  editMission(): void {

    const mission = this.mission();

    if (!mission) return;

    this.router.navigate(['/missions'], { queryParams: { edit: mission.id } });

  }

  deleteMission(): void {

    const mission = this.mission();

    if (!mission) return;

    this.router.navigate(['/missions'], { queryParams: { delete: mission.id } });

  }

  // ==========================================================
  // ASSIGNMENT
  // ==========================================================

  openAssignmentModal(): void {

    const current = this.mission();

    if (!current) return;

    // Reset to the current saved values in case a previous
    // edit was opened and cancelled without saving.
    this.driverId = current.driverId ?? null;
    this.vehicleId = current.vehicleId ?? null;

    const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));

    modal.show();

  }

  updateAssignment(): void {

    const current = this.mission();

    if (!current) return;

    const request = {
      driverId: this.driverId,
      vehicleId: this.vehicleId
    };

    this.missionService.assignMission(current.id, request).subscribe({

      next: (updatedMission) => {

        this.mission.set(updatedMission);

        this.driverId = updatedMission.driverId ?? null;
        this.vehicleId = updatedMission.vehicleId ?? null;

        bootstrap.Modal.getInstance(document.getElementById('assignmentModal'))?.hide();

        this.toastService.success('Assignment updated successfully');

      },

      error: (err: any) => {

        console.error(err);

        this.toastService.error('Failed to update assignment');

      }

    });

  }

  // ==========================================================
  // DOCUMENT VERIFICATION
  // ==========================================================

  validateDocuments(): void {

    const current = this.mission();

    if (!current) return;

    this.missionService.updateDocumentsVerification(current.id, true).subscribe({

      next: (updatedMission: Mission) => {

        this.mission.set(updatedMission);

        this.documentsVerified.set(updatedMission.documentsVerified ?? false);
        this.verificationDate.set(updatedMission.documentsVerificationDate ?? null);

        this.toastService.success('Documents validated');

        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);

        this.toastService.error('Failed to validate documents');

      }

    });

  }

  rejectDocuments(): void {

    const current = this.mission();

    if (!current) return;

    this.missionService.updateDocumentsVerification(current.id, false).subscribe({

      next: (updatedMission: Mission) => {

        this.mission.set(updatedMission);

        this.documentsVerified.set(updatedMission.documentsVerified ?? false);
        this.verificationDate.set(updatedMission.documentsVerificationDate ?? null);

        this.toastService.success('Documents marked as not verified');

        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);

        this.toastService.error('Failed to update documents');

      }

    });

  }

  editDocumentsVerification(): void {

    const current = this.mission();

    if (!current || !current.documentsVerificationDate) return;

    this.selectedValidationStatus = current.documentsVerified ? 'APPROVED' : 'REJECTED';

    const modalElement = document.getElementById('changeValidationModal');

    if (!modalElement) return;

    bootstrap.Modal.getOrCreateInstance(modalElement).show();

  }

  saveDocumentsVerification(): void {

    const current = this.mission();

    if (!current) return;

    // NOTE: 'PENDING' sends null to reset the verification decision.
    // This requires MissionService.updateDocumentsVerification (and the
    // backend endpoint behind it) to accept `verified: boolean | null`,
    // not just boolean — confirm/extend that signature if it's not there yet.
    const verified: boolean | null =
      this.selectedValidationStatus === 'PENDING'
        ? null
        : this.selectedValidationStatus === 'APPROVED';

    this.missionService.updateDocumentsVerification(current.id, verified as any).subscribe({

      next: (updatedMission: Mission) => {

        this.mission.set(updatedMission);

        this.documentsVerified.set(updatedMission.documentsVerified ?? false);
        this.verificationDate.set(updatedMission.documentsVerificationDate ?? null);

        bootstrap.Modal.getInstance(document.getElementById('changeValidationModal'))?.hide();

        this.toastService.success('Verification status updated');

        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);

        this.toastService.error('Failed to update verification status');

      }

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

    this.missionService.saveVehicleInspection(current.id, request).subscribe({

      next: (updatedMission: Mission) => {

        this.mission.set(updatedMission);

        if (updatedMission.vehicleInspection) {

          this.inspectionMileage = updatedMission.vehicleInspection.mileage;
          this.inspectionFuelLevel = updatedMission.vehicleInspection.fuelLevel;
          this.inspectionNotes = updatedMission.vehicleInspection.notes ?? '';

        }

        bootstrap.Modal.getInstance(document.getElementById('inspectionModal'))?.hide();

        this.loadMission(current.id);

        this.toastService.success('Inspection saved successfully');

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.toastService.error('Failed to save inspection');

      }

    });

  }

  deleteInspection(): void {

    const mission = this.mission();

    if (!mission?.vehicleInspection) return;

    this.missionService.deleteInspection(mission.id).subscribe({

      next: () => {

        bootstrap.Modal.getInstance(document.getElementById('deleteInspectionModal'))?.hide();

        this.loadMission(mission.id);

        this.toastService.success('Inspection deleted successfully');

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.toastService.error('Failed to delete inspection');

      }

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

    this.missionService.uploadInspectionPhoto(current.id, this.selectedPhoto).subscribe({

      next: () => {

        this.selectedPhoto = null;
        this.photoPreview = null;

        const input = document.getElementById('missionPhotoInput') as HTMLInputElement;

        if (input) {
          input.value = '';
        }

        this.loadMission(current.id);

        this.toastService.success('Photo uploaded successfully');

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        // TODO: Backend should return HTTP 413 for MaxUploadSizeExceededException.
        // Current scenario: any 403 during upload is treated as "photo too large".
        if (err.status === 403) {

          bootstrap.Modal.getOrCreateInstance(document.getElementById('photoSizeModal')).show();

          return;

        }

        console.error(err);

        this.toastService.error('Failed to upload photo');

      }

    });

  }

  deletePhoto(photoId: string): void {

    this.photoToDeleteId.set(photoId);

    const modal = new bootstrap.Modal(document.getElementById('deletePhotoModal'));

    modal.show();

  }

  confirmDeletePhoto(): void {

    const current = this.mission();

    const photoId = this.photoToDeleteId();

    if (!current || !photoId) return;

    this.missionService.deleteInspectionPhoto(current.id, photoId).subscribe({

      next: (updatedMission: Mission) => {

        this.mission.set(updatedMission);

        this.photoToDeleteId.set(null);

        bootstrap.Modal.getInstance(document.getElementById('deletePhotoModal'))?.hide();

        this.toastService.success('Photo deleted successfully');

        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);

        this.photoToDeleteId.set(null);

        bootstrap.Modal.getInstance(document.getElementById('deletePhotoModal'))?.hide();

        this.toastService.error('Failed to delete photo');

      }

    });

  }

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  previewMissionDocument(id: string) {

    this.missionDocumentService.previewMissionDocument(id).subscribe({

      next: (blob) => {

        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 60000);

      },

      error: (error) => {

        console.error('Failed to preview mission document', error);

        this.toastService.error('Failed to open document');

      }

    });

  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  getStatusClass(status: string): string {

    switch (status) {
      case 'ONGOING': return 'bg-info';
      case 'COMPLETED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-warning';
    }

  }

  photoUrl(url: string): string {
    return this.missionService.getPhotoUrl(url);
  }

  goBack(): void {
    this.router.navigate(['/missions']);
  }

}