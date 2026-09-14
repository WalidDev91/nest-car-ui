import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import feather from 'feather-icons';

import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';
import { Vehicle } from '../../models/vehicle';
import { User } from '../../models/user';
import { MissionVehicleInspection } from '../../models/mission-vehicle-inspection';
import { UserService } from '../../services/user.service';
import { VehicleService } from '../../services/vehicle.service';
import { MissionDocumentService } from '../../services/mission-document.service';

declare var bootstrap: any;

@Component({
  selector: 'app-mission-details',
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

  selectedInspectionType: 'BEFORE' | 'AFTER' = 'BEFORE';

  inspectionMileage: number | null = null;
  inspectionFuelLevel: number | null = null;
  inspectionTirePressure = '';
  inspectionOilChange = '';
  inspectionWaterCheck = '';
  inspectionPartsCondition = '';
  inspectionRepairStatus = '';
  inspectionAccidentOccurred = false;
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

  hasInspection = computed(() =>
    (this.mission()?.vehicleInspections?.length ?? 0) > 0
  );

  totalPhotos = computed(() =>
    this.mission()?.vehicleInspections
      ?.reduce((total, inspection) => total + (inspection.photos?.length ?? 0), 0) ?? 0
  );

  totalDocuments = computed(() =>
    this.mission()?.documents?.length ?? 0
  );

  constructor(
    private route: ActivatedRoute,
    private missionService: MissionService,
    private userService: UserService,
    private vehicleService: VehicleService,
    private missionDocumentService: MissionDocumentService,
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

        this.resetInspectionForm();

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



      },

      error: (err: any) => {

        console.error(err);


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



        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);



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



        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);



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



        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);



      }

    });

  }

  // ==========================================================
  // INSPECTION
  // ==========================================================

  // ==========================================================
  // SAVE INSPECTION
  // ==========================================================

  saveVehicleInspection(): void {

    const current = this.mission();

    if (!current) return;

    const request = {
      inspectionType: this.selectedInspectionType,
      mileage: this.inspectionMileage,
      fuelLevel: this.inspectionFuelLevel,
      tirePressure: this.inspectionTirePressure,
      oilChange: this.inspectionOilChange,
      waterCheck: this.inspectionWaterCheck,
      partsCondition: this.inspectionPartsCondition,
      repairStatus: this.inspectionRepairStatus,
      accidentOccurred: this.inspectionAccidentOccurred,
      notes: this.inspectionNotes
    };

    this.missionService.saveVehicleInspection(
      current.id,
      request
    ).subscribe({

      next: () => {

        bootstrap.Modal
          .getInstance(document.getElementById('inspectionModal'))
          ?.hide();

        this.loadMission(current.id);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

      }

    });
  }

  // ==========================================================
  // DELETE INSPECTION
  // ==========================================================

  inspectionToDeleteId: string | null = null;

  deleteInspection(inspectionId: string): void {

    this.inspectionToDeleteId = inspectionId;

    const modal = new bootstrap.Modal(
      document.getElementById('deleteInspectionModal')
    );

    modal.show();
  }

  confirmDeleteInspection(): void {

    const mission = this.mission();
    const inspectionId = this.inspectionToDeleteId;

    if (!mission || !inspectionId) return;

    this.missionService.deleteInspection(
      inspectionId
    ).subscribe({

      next: (updatedMission: Mission) => {

        this.mission.set(updatedMission);

        this.inspectionToDeleteId = null;

        bootstrap.Modal
          .getInstance(document.getElementById('deleteInspectionModal'))
          ?.hide();

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.inspectionToDeleteId = null;

        bootstrap.Modal
          .getInstance(document.getElementById('deleteInspectionModal'))
          ?.hide();

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

    if (!this.selectedPhoto) return;

    const inspection = this.getInspection(this.selectedInspectionType);

    if (!inspection) return;

    this.missionService.uploadInspectionPhoto(
      inspection.id,
      this.selectedPhoto
    ).subscribe({

      next: () => {

        this.selectedPhoto = null;
        this.photoPreview = null;

        const input =
          document.getElementById('missionPhotoInput') as HTMLInputElement;

        if (input) {
          input.value = '';
        }

        const current = this.mission();

        if (current) {
          this.loadMission(current.id);
        }

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

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



        setTimeout(() => feather.replace(), 0);

      },

      error: (err: any) => {

        console.error(err);

        this.photoToDeleteId.set(null);

        bootstrap.Modal.getInstance(document.getElementById('deletePhotoModal'))?.hide();



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


  // ==========================================================
  // INSPECTION HELPERS
  // ==========================================================

  getInspection(type: 'BEFORE' | 'AFTER'): MissionVehicleInspection | undefined {

    return this.mission()?.vehicleInspections?.find(
      inspection => inspection.inspectionType === type
    );

  }

  openInspectionModal(type: 'BEFORE' | 'AFTER'): void {

    const inspection = this.getInspection(type);

    this.selectedInspectionType = type;

    if (inspection) {

      this.inspectionMileage = inspection.mileage ?? null;
      this.inspectionFuelLevel = inspection.fuelLevel ?? null;
      this.inspectionTirePressure = inspection.tirePressure ?? '';
      this.inspectionOilChange = inspection.oilChange ?? '';
      this.inspectionWaterCheck = inspection.waterCheck ?? '';
      this.inspectionPartsCondition = inspection.partsCondition ?? '';
      this.inspectionRepairStatus = inspection.repairStatus ?? '';
      this.inspectionAccidentOccurred = inspection.accidentOccurred ?? false;
      this.inspectionNotes = inspection.notes ?? '';

    } else {

      this.resetInspectionForm();

      this.selectedInspectionType = type;

    }

    const modalElement = document.getElementById('inspectionModal');

    if (!modalElement) return;

    bootstrap.Modal.getOrCreateInstance(modalElement).show();

  }

  resetInspectionForm(): void {

    this.inspectionMileage = null;
    this.inspectionFuelLevel = null;
    this.inspectionTirePressure = '';
    this.inspectionOilChange = '';
    this.inspectionWaterCheck = '';
    this.inspectionPartsCondition = '';
    this.inspectionRepairStatus = '';
    this.inspectionAccidentOccurred = false;
    this.inspectionNotes = '';

  }



}