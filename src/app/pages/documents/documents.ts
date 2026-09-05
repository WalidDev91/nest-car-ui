import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';
import { forkJoin } from 'rxjs';

import { DriverDocumentService } from '../../services/driver-document.service';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionDocumentService } from '../../services/mission-document.service';

import { VehicleService } from '../../services/vehicle.service';
import { MissionService } from '../../services/mission.service';

import { DriverDocument } from '../../models/driver-document';
import { VehicleDocument } from '../../models/vehicle-document';
import { MissionDocument } from '../../models/mission-document';

declare var bootstrap: any;

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class Documents implements OnInit {

  // ==========================
  // TABS
  // ==========================

  selectedTab = signal<'driver' | 'vehicle' | 'mission'>('driver');

  // ==========================
  // DATA
  // ==========================

  driverDocs = signal<DriverDocument[]>([]);
  vehicleDocs = signal<VehicleDocument[]>([]);
  missionDocs = signal<MissionDocument[]>([]);

  vehicles = signal<any[]>([]);
  missions = signal<any[]>([]);

  loading = signal(false);

  // ==========================
  // SEARCH / FILTERS
  // ==========================

  search = signal('');

  driverStatusFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  vehicleTypeFilter = signal<'ALL' | 'LICENSE' | 'TECHNICAL_CHECK' | 'INSURANCE' | 'VEHICLE_TAX' | 'OTHER'>('ALL');

  hasActiveFilters = computed(() => {

    if (this.search().trim().length > 0) return true;

    if (this.selectedTab() === 'driver' && this.driverStatusFilter() !== 'ALL') return true;

    if (this.selectedTab() === 'vehicle' && this.vehicleTypeFilter() !== 'ALL') return true;

    return false;

  });

  // ==========================
  // PAGINATION
  // ==========================

  currentPage = signal(1);

  pageSize = 10;

  // ==========================
  // FILTERED DATA
  // ==========================

  filteredDocuments = computed(() => {

    let docs: any[] = [];

    if (this.selectedTab() === 'driver') docs = this.driverDocs();
    if (this.selectedTab() === 'vehicle') docs = this.vehicleDocs();
    if (this.selectedTab() === 'mission') docs = this.missionDocs();

    if (this.selectedTab() === 'driver' && this.driverStatusFilter() !== 'ALL') {
      docs = docs.filter(d => d.status === this.driverStatusFilter());
    }

    if (this.selectedTab() === 'vehicle' && this.vehicleTypeFilter() !== 'ALL') {
      docs = docs.filter(d => d.type === this.vehicleTypeFilter());
    }

    const value = this.search().toLowerCase();

    if (!value) return docs;

    return docs.filter(doc =>
      doc.title?.toLowerCase().includes(value) ||
      JSON.stringify(doc).toLowerCase().includes(value)
    );

  });

  paginatedDocuments = computed(() => {

    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredDocuments().slice(start, start + this.pageSize);

  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDocuments().length / this.pageSize))
  );

  // ==========================
  // STATISTICS
  // ==========================

  totalDocuments = computed(() =>
    this.driverDocs().length + this.vehicleDocs().length + this.missionDocs().length
  );

  driverCount = computed(() => this.driverDocs().length);
  vehicleCount = computed(() => this.vehicleDocs().length);
  missionCount = computed(() => this.missionDocs().length);

  // ==========================
  // ROLE
  // ==========================

  isDriver = localStorage.getItem('role') === 'DRIVER';

  currentUserId = localStorage.getItem('userId') ?? '';

  canUpload = computed(() =>
    this.selectedTab() === 'driver' ? this.isDriver : !this.isDriver
  );

  // ==========================
  // UPLOAD DRIVER
  // ==========================

  selectedDriverFile: File | null = null;
  uploadDriverTitle = '';
  uploadDriverType = '';
  uploadDriverExpiryDate = '';

  driverTitleError = false;
  driverTypeError = false;
  driverExpiryDateError = false;
  driverFileError = false;

  selectedDriverDocument = signal<any | null>(null);

  selectedValidationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';

  editDriverMode = false;
  editingDriverDocumentId: string | null = null;
  driverDocumentToDeleteId: string | null = null;

  editVehicleMode = false;
  editingVehicleDocumentId: string | null = null;
  vehicleDocumentToDeleteId: string | null = null;

  editMissionMode = false;
  editingMissionDocumentId: string | null = null;
  missionDocumentToDeleteId: string | null = null;

  // ==========================
  // UPLOAD VEHICLE
  // ==========================

  selectedVehicleFile: File | null = null;
  uploadVehicleTitle = '';
  uploadVehicleType = '';
  uploadVehicleExpiryDate = '';

  vehicleTitleError = false;
  vehicleTypeError = false;
  vehicleExpiryDateError = false;
  vehicleIdError = false;
  vehicleFileError = false;

  uploadVehicleId = '';

  // ==========================
  // UPLOAD MISSION
  // ==========================

  selectedMissionFile: File | null = null;
  uploadMissionTitle = '';
  uploadMissionId = '';

  missionTitleError = false;
  missionIdError = false;
  missionFileError = false;

  constructor(
    private driverDocumentService: DriverDocumentService,
    private vehicleDocumentService: VehicleDocumentService,
    private missionDocumentService: MissionDocumentService,
    private vehicleService: VehicleService,
    private missionService: MissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  // ==========================
  // LOAD EVERYTHING
  // ==========================

  loadDocuments(): void {

    this.loading.set(true);

    forkJoin({
      driverDocs: this.driverDocumentService.getAll(),
      vehicleDocs: this.vehicleDocumentService.getAll(),
      missionDocs: this.missionDocumentService.getAll(),
      vehicles: this.vehicleService.getAll(),
      missions: this.missionService.getAll()
    }).subscribe({

      next: (result) => {

        this.driverDocs.set(result.driverDocs);
        this.vehicleDocs.set(result.vehicleDocs);
        this.missionDocs.set(result.missionDocs);
        this.vehicles.set(result.vehicles);
        this.missions.set(result.missions);

        this.loading.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: (err) => {

        console.error('Error loading documents:', err);

        this.loading.set(false);


      }

    });

  }

  selectTab(tab: 'driver' | 'vehicle' | 'mission') {

    this.selectedTab.set(tab);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  onSearch(value: string) {

    this.search.set(value);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  filterDriverStatus(value: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') {

    this.driverStatusFilter.set(value);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  filterVehicleType(value: 'ALL' | 'LICENSE' | 'TECHNICAL_CHECK' | 'INSURANCE' | 'VEHICLE_TAX' | 'OTHER') {

    this.vehicleTypeFilter.set(value);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  clearFilters() {

    this.search.set('');

    this.driverStatusFilter.set('ALL');
    this.vehicleTypeFilter.set('ALL');

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  nextPage() {

    if (this.currentPage() < this.totalPages()) {

      this.currentPage.update(p => p + 1);

      setTimeout(() => feather.replace(), 0);

    }

  }

  previousPage() {

    if (this.currentPage() > 1) {

      this.currentPage.update(p => p - 1);

      setTimeout(() => feather.replace(), 0);

    }

  }

  // ==========================
  // FILE VALIDATION
  // ==========================

  validateFile(file: File): boolean {

    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!allowed.includes(file.type)) {


      return false;

    }

    if (file.size > 10_000_000) {


      return false;

    }

    return true;

  }

  // ==========================
  // NAVIGATION
  // ==========================

  onDriverFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedDriverFile = input.files[0];
    }

  }

  onVehicleFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedVehicleFile = input.files[0];
    }

  }

  onMissionFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedMissionFile = input.files[0];
    }

  }

  downloadFile(response: any, fallbackName: string) {

    const blob = response.body;

    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : fallbackName;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

  }

  downloadDriver(id: string) {

    this.driverDocumentService.download(id).subscribe({

      next: response => this.downloadFile(response, 'driver-document'),

      error: err => {

        console.error(err);


      }

    });

  }

  downloadVehicle(id: string) {

    this.vehicleDocumentService.download(id).subscribe({

      next: response => this.downloadFile(response, 'vehicle-document'),

      error: err => {

        console.error(err);

      }

    });

  }

  downloadMission(id: string) {

    this.missionDocumentService.download(id).subscribe({

      next: response => this.downloadFile(response, 'mission-document'),

      error: err => {

        console.error(err);


      }

    });

  }

  // ==========================
  // CREATE MODALS (per current tab)
  // ==========================

  openCreateModalForCurrentTab(): void {

    if (this.selectedTab() === 'driver') this.openCreateDriverDocumentModal();
    if (this.selectedTab() === 'vehicle') this.openCreateVehicleDocumentModal();
    if (this.selectedTab() === 'mission') this.openCreateMissionDocumentModal();

  }

  openCreateDriverDocumentModal(): void {

    this.editDriverMode = false;
    this.editingDriverDocumentId = null;

    this.uploadDriverTitle = '';
    this.uploadDriverType = '';
    this.uploadDriverExpiryDate = '';
    this.selectedDriverFile = null;

    this.driverTitleError = false;
    this.driverTypeError = false;
    this.driverExpiryDateError = false;
    this.driverFileError = false;

    new bootstrap.Modal(
      document.getElementById('uploadDriverDocumentModal')
    ).show();
  }

  openCreateVehicleDocumentModal(): void {

    this.editVehicleMode = false;
    this.editingVehicleDocumentId = null;

    this.uploadVehicleTitle = '';
    this.uploadVehicleType = '';
    this.uploadVehicleExpiryDate = '';
    this.uploadVehicleId = '';
    this.selectedVehicleFile = null;

    this.vehicleTitleError = false;
    this.vehicleTypeError = false;
    this.vehicleExpiryDateError = false;
    this.vehicleIdError = false;
    this.vehicleFileError = false;

    new bootstrap.Modal(
      document.getElementById('uploadVehicleDocumentModal')
    ).show();
  }

  openCreateMissionDocumentModal(): void {

    this.editMissionMode = false;
    this.editingMissionDocumentId = null;

    this.uploadMissionTitle = '';
    this.uploadMissionId = '';
    this.selectedMissionFile = null;

    this.missionTitleError = false;
    this.missionIdError = false;
    this.missionFileError = false;

    new bootstrap.Modal(document.getElementById('uploadMissionDocumentModal')).show();

  }

  // ==========================
  // UPLOAD / EDIT — MISSION
  // ==========================

  uploadMissionDocument() {

    if (this.editMissionMode && this.editingMissionDocumentId) {

      this.missionTitleError = !this.uploadMissionTitle.trim();

      if (this.missionTitleError) return;

      this.missionDocumentService.update(
        this.editingMissionDocumentId,
        { title: this.uploadMissionTitle }
      ).subscribe({

        next: () => {

          this.loadDocuments();

          this.resetMissionModal();

        },

        error: err => {

          console.error(err);

        }

      });

      return;

    }

    this.missionTitleError = !this.uploadMissionTitle.trim();
    this.missionIdError = !this.uploadMissionId;
    this.missionFileError = !this.selectedMissionFile;

    if (this.missionTitleError || this.missionIdError || this.missionFileError) return;

    if (!this.validateFile(this.selectedMissionFile!)) return;

    this.missionDocumentService.upload(
      this.selectedMissionFile!,
      this.uploadMissionTitle,
      this.uploadMissionId
    ).subscribe({

      next: () => {

        this.loadDocuments();

        this.resetMissionModal();



      },

      error: err => {

        console.error(err);


      }

    });

  }

  // ==========================
  // UPLOAD / EDIT — VEHICLE
  // ==========================

  uploadVehicleDocument() {

    if (this.editVehicleMode && this.editingVehicleDocumentId) {

      this.vehicleTitleError = !this.uploadVehicleTitle.trim();
      this.vehicleTypeError = !this.uploadVehicleType;
      this.vehicleExpiryDateError = !this.uploadVehicleExpiryDate;

      if (
        this.vehicleTitleError ||
        this.vehicleTypeError ||
        this.vehicleExpiryDateError
      ) {
        return;
      }

      this.vehicleDocumentService.update(
        this.editingVehicleDocumentId,
        {
          title: this.uploadVehicleTitle,
          type: this.uploadVehicleType,
          expiryDate: this.uploadVehicleExpiryDate
        }
      ).subscribe({

        next: () => {
          this.loadDocuments();
          this.resetVehicleModal();

        },

        error: err => {
          console.error(err);

        }

      });

      return;
    }

    this.vehicleTitleError = !this.uploadVehicleTitle.trim();
    this.vehicleTypeError = !this.uploadVehicleType;
    this.vehicleExpiryDateError = !this.uploadVehicleExpiryDate;
    this.vehicleIdError = !this.uploadVehicleId;
    this.vehicleFileError = !this.selectedVehicleFile;

    if (
      this.vehicleTitleError ||
      this.vehicleTypeError ||
      this.vehicleExpiryDateError ||
      this.vehicleIdError ||
      this.vehicleFileError
    ) {
      return;
    }

    if (!this.validateFile(this.selectedVehicleFile!)) return;

    this.vehicleDocumentService.upload(
      this.selectedVehicleFile!,
      this.uploadVehicleTitle,
      this.uploadVehicleType,
      this.uploadVehicleExpiryDate,
      this.uploadVehicleId
    ).subscribe({

      next: () => {
        this.loadDocuments();
        this.resetVehicleModal();

      },

      error: err => {
        console.error(err);

      }

    });
  }

  // ==========================
  // UPLOAD / EDIT — DRIVER
  // ==========================

  uploadDriverDocument() {

    this.driverTitleError = !this.uploadDriverTitle.trim();
    this.driverTypeError = !this.uploadDriverType;
    this.driverExpiryDateError = !this.uploadDriverExpiryDate;

    if (
      this.driverTitleError ||
      this.driverTypeError ||
      this.driverExpiryDateError
    ) {
      return;
    }

    if (this.editDriverMode && this.editingDriverDocumentId) {

      this.driverDocumentService.update(
        this.editingDriverDocumentId,
        {
          title: this.uploadDriverTitle,
          type: this.uploadDriverType,
          expiryDate: this.uploadDriverExpiryDate
        }
      ).subscribe({

        next: () => {
          this.loadDocuments();
          this.resetDriverModal();

        },

        error: err => {
          console.error(err);

        }

      });

      return;
    }

    this.driverFileError = !this.selectedDriverFile;

    if (this.driverFileError) return;

    if (!this.validateFile(this.selectedDriverFile!)) return;

    this.driverDocumentService.upload(
      this.selectedDriverFile!,
      this.uploadDriverTitle,
      this.uploadDriverExpiryDate,
      this.uploadDriverType,
      this.currentUserId
    ).subscribe({

      next: () => {
        this.loadDocuments();
        this.resetDriverModal();

      },

      error: err => {
        console.error(err);

      }

    });
  }

  // ==========================
  // RESET MODALS
  // ==========================

  resetDriverModal(): void {

    this.editDriverMode = false;
    this.editingDriverDocumentId = null;

    this.uploadDriverTitle = '';
    this.uploadDriverType = '';
    this.uploadDriverExpiryDate = '';
    this.selectedDriverFile = null;

    this.driverTitleError = false;
    this.driverTypeError = false;
    this.driverExpiryDateError = false;
    this.driverFileError = false;

    const input = document.getElementById(
      'driverFileInput'
    ) as HTMLInputElement;

    if (input) input.value = '';

    bootstrap.Modal
      .getInstance(document.getElementById('uploadDriverDocumentModal'))
      ?.hide();
  }

  resetVehicleModal(): void {

    this.editVehicleMode = false;
    this.editingVehicleDocumentId = null;

    this.uploadVehicleTitle = '';
    this.uploadVehicleType = '';
    this.uploadVehicleExpiryDate = '';
    this.uploadVehicleId = '';
    this.selectedVehicleFile = null;

    this.vehicleTitleError = false;
    this.vehicleTypeError = false;
    this.vehicleExpiryDateError = false;
    this.vehicleIdError = false;
    this.vehicleFileError = false;

    const input = document.getElementById(
      'vehicleFileInput'
    ) as HTMLInputElement;

    if (input) input.value = '';

    bootstrap.Modal
      .getInstance(document.getElementById('uploadVehicleDocumentModal'))
      ?.hide();
  }

  resetMissionModal(): void {

    this.editMissionMode = false;
    this.editingMissionDocumentId = null;
    this.uploadMissionTitle = '';
    this.uploadMissionId = '';
    this.selectedMissionFile = null;

    this.missionTitleError = false;
    this.missionIdError = false;
    this.missionFileError = false;

    const input = document.getElementById('missionFileInput') as HTMLInputElement;

    if (input) input.value = '';

    bootstrap.Modal.getInstance(document.getElementById('uploadMissionDocumentModal'))?.hide();

  }

  openEditDriverDocumentModal(doc: DriverDocument): void {

    this.editDriverMode = true;
    this.editingDriverDocumentId = doc.id;

    this.uploadDriverTitle = doc.title;
    this.uploadDriverType = doc.type;
    this.uploadDriverExpiryDate = doc.expiryDate;

    this.selectedDriverFile = null;

    this.driverTitleError = false;
    this.driverTypeError = false;
    this.driverExpiryDateError = false;
    this.driverFileError = false;

    new bootstrap.Modal(
      document.getElementById('uploadDriverDocumentModal')
    ).show();
  }

  openEditVehicleDocumentModal(doc: VehicleDocument): void {

    this.editVehicleMode = true;
    this.editingVehicleDocumentId = doc.id;

    this.uploadVehicleTitle = doc.title;
    this.uploadVehicleType = doc.type;
    this.uploadVehicleExpiryDate = doc.expiryDate;

    this.selectedVehicleFile = null;

    this.vehicleTitleError = false;
    this.vehicleTypeError = false;
    this.vehicleExpiryDateError = false;
    this.vehicleIdError = false;
    this.vehicleFileError = false;

    new bootstrap.Modal(
      document.getElementById('uploadVehicleDocumentModal')
    ).show();
  }

  openEditMissionDocumentModal(doc: MissionDocument): void {

    this.editMissionMode = true;
    this.editingMissionDocumentId = doc.id;
    this.uploadMissionTitle = doc.title;
    this.selectedMissionFile = null;

    this.missionTitleError = false;
    this.missionIdError = false;
    this.missionFileError = false;

    new bootstrap.Modal(document.getElementById('uploadMissionDocumentModal')).show();

  }

  // ==========================
  // DELETE — DRIVER
  // ==========================

  deleteDriverDocument(id: string): void {

    this.driverDocumentToDeleteId = id;

    new bootstrap.Modal(document.getElementById('deleteDriverDocumentModal')).show();

  }

  confirmDeleteDriverDocument(): void {

    if (!this.driverDocumentToDeleteId) return;

    this.driverDocumentService.deleteDriverDocument(this.driverDocumentToDeleteId).subscribe({

      next: () => {

        this.loadDocuments();

        this.driverDocumentToDeleteId = null;

        bootstrap.Modal.getInstance(document.getElementById('deleteDriverDocumentModal'))?.hide();

      },

      error: err => {

        console.error(err);

      }

    });

  }

  // ==========================
  // DELETE — VEHICLE
  // ==========================

  deleteVehicleDocument(id: string): void {

    this.vehicleDocumentToDeleteId = id;

    new bootstrap.Modal(document.getElementById('deleteVehicleDocumentModal')).show();

  }

  confirmDeleteVehicleDocument(): void {

    if (!this.vehicleDocumentToDeleteId) return;

    this.vehicleDocumentService.delete(this.vehicleDocumentToDeleteId).subscribe({

      next: () => {

        this.loadDocuments();

        this.vehicleDocumentToDeleteId = null;

        bootstrap.Modal.getInstance(document.getElementById('deleteVehicleDocumentModal'))?.hide();

      },

      error: err => {

        console.error(err);



      }

    });

  }

  // ==========================
  // DELETE — MISSION
  // ==========================

  deleteMissionDocument(id: string): void {

    this.missionDocumentToDeleteId = id;

    new bootstrap.Modal(document.getElementById('deleteMissionDocumentModal')).show();

  }

  confirmDeleteMissionDocument(): void {

    if (!this.missionDocumentToDeleteId) return;

    this.missionDocumentService.deleteDocument(this.missionDocumentToDeleteId).subscribe({

      next: () => {

        this.loadDocuments();

        this.missionDocumentToDeleteId = null;

        bootstrap.Modal.getInstance(document.getElementById('deleteMissionDocumentModal'))?.hide();



      },

      error: err => {

        console.error(err);


      }

    });

  }

  // ==========================
  // PREVIEW
  // ==========================

  previewDriverDocument(id: string): void {

    this.driverDocumentService.previewDriverDocument(id).subscribe({

      next: blob => {

        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 1000);

      },

      error: err => {

        console.error(err);


      }

    });

  }

  previewVehicleDocument(id: string): void {

    this.vehicleDocumentService.previewVehicleDocument(id).subscribe({

      next: blob => {

        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 1000);

      },

      error: err => {

        console.error(err);



      }

    });

  }

  previewMissionDocument(id: string): void {

    this.missionDocumentService.previewMissionDocument(id).subscribe({

      next: blob => {

        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 1000);

      },

      error: err => {

        console.error(err);



      }

    });

  }

  // ==========================
  // DRIVER VALIDATION
  // ==========================

  approveDriverDocument(id: string): void {

    this.driverDocumentService.updateDriverDocumentStatus(id, 'APPROVED').subscribe({

      next: () => {

        this.loadDocuments();


      },

      error: err => {

        console.error(err);

      }

    });

  }

  rejectDriverDocument(id: string): void {

    this.driverDocumentService.updateDriverDocumentStatus(id, 'REJECTED').subscribe({

      next: () => {

        this.loadDocuments();


      },

      error: err => {

        console.error(err);


      }

    });

  }

  openChangeValidationModal(doc: any): void {

    this.selectedDriverDocument.set(doc);

    this.selectedValidationStatus = doc.status;

    new bootstrap.Modal(document.getElementById('changeValidationModal')).show();

  }

  saveDriverValidation(): void {

    const doc = this.selectedDriverDocument();

    if (!doc) return;

    this.driverDocumentService.updateDriverDocumentStatus(doc.id, this.selectedValidationStatus).subscribe({

      next: () => {

        bootstrap.Modal.getInstance(document.getElementById('changeValidationModal'))?.hide();

        this.selectedDriverDocument.set(null);

        this.loadDocuments();

      },

      error: err => {

        console.error(err);


      }

    });

  }

}