import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';
import { VehiclePhoto } from '../../models/vehicle-photo';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionService } from '../../services/mission.service';
import { ToastService } from '../../services/toast.service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {

  // ==========================================================
  // DATA
  // ==========================================================

  vehicles = signal<Vehicle[]>([]);
  missions = signal<any[]>([]);
  vehicleDocuments = signal<any[]>([]);
  loading = signal(false);

  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  search = signal('');

  availabilityFilter = signal<'ALL' | 'AVAILABLE' | 'IN_MISSION'>('ALL');

  hasActiveFilters = computed(() =>
    this.search().trim().length > 0 ||
    this.availabilityFilter() !== 'ALL'
  );

  // ==========================================================
  // SORT
  // ==========================================================

  sortColumn = signal('plateNumber');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // ==========================================================
  // PAGINATION
  // ==========================================================

  pageSize = signal(10);
  currentPage = signal(1);

  // ==========================================================
  // CREATE / EDIT FORM
  // ==========================================================

  editMode = false;

  editingVehicleId: string | null = null;

  submitted = signal(false);

  plateNumber = '';
  brand = '';
  model = '';
  year = new Date().getFullYear();

  // Newly staged files (create or edit) — NOT yet uploaded to the server.
  // Signals, not plain arrays: FileReader.onload fires async, and a plain
  // array mutated there never triggers a re-render under this app's
  // change detection — same class of bug we keep finding elsewhere.
  selectedPhotos = signal<File[]>([]);
  photoPreviews = signal<string[]>([]);

  // Photos already saved on the vehicle (edit mode only).
  existingPhotos = signal<VehiclePhoto[]>([]);

  role = localStorage.getItem('role') ?? '';

  get isDriver() {
    return this.role === 'DRIVER';
  }

  // ==========================================================
  // VALIDATION
  // ==========================================================

  get plateNumberInvalid(): boolean {
    return this.submitted() && !this.plateNumber.trim();
  }

  get brandInvalid(): boolean {
    return this.submitted() && !this.brand.trim();
  }

  get modelInvalid(): boolean {
    return this.submitted() && !this.model.trim();
  }

  get yearInvalid(): boolean {
    if (!this.submitted()) return false;
    const currentYear = new Date().getFullYear();
    return !this.year || this.year < 1980 || this.year > currentYear + 1;
  }

  // ==========================================================
  // DELETE VEHICLE
  // ==========================================================

  vehicleToDeleteId = signal<string | null>(null);

  vehicleToDeletePlate = computed(() => {
    const id = this.vehicleToDeleteId();
    return this.vehicles().find(v => v.id === id)?.plateNumber ?? '';
  });

  linkedDocumentsCount = computed(() => {
    const id = this.vehicleToDeleteId();
    if (!id) return 0;
    return this.vehicleDocuments().filter((d: any) => d.vehicleId === id).length;
  });

  linkedMissionsCount = computed(() => {
    const id = this.vehicleToDeleteId();
    if (!id) return 0;
    return this.missions().filter((m: any) => m.vehicleId === id).length;
  });

  hasLinkedRecords = computed(() =>
    this.linkedDocumentsCount() > 0 || this.linkedMissionsCount() > 0
  );

  // ==========================================================
  // STAT CARDS
  // ==========================================================

  totalVehicles = computed(() =>
    this.vehicles().length
  );

  vehicleStatusMap = computed(() => {

    const activeVehicleIds = new Set(
      this.missions()
        .filter(m =>
          m.vehicleId &&
          m.status === 'ONGOING'
        )
        .map(m => m.vehicleId)
    );

    const map = new Map<string, 'IN_MISSION' | 'AVAILABLE'>();

    this.vehicles().forEach(v => {

      map.set(
        v.id,
        activeVehicleIds.has(v.id)
          ? 'IN_MISSION'
          : 'AVAILABLE'
      );

    });

    return map;

  });

  vehiclesInMission = computed(() =>
    this.vehicles().filter(v =>
      this.vehicleStatusMap().get(v.id) === 'IN_MISSION'
    ).length
  );

  availableVehicles = computed(() =>
    this.totalVehicles() - this.vehiclesInMission()
  );

  averageVehicleAge = computed(() => {

    if (!this.vehicles().length) return '-';

    const currentYear = new Date().getFullYear();

    const totalAge = this.vehicles()
      .reduce((sum, v) => sum + (currentYear - v.year), 0);

    const avg = totalAge / this.vehicles().length;

    return avg.toFixed(1);

  });

  // ==========================================================
  // FILTERED / SORTED
  // ==========================================================

  filteredVehicles = computed(() => {

    let data = [...this.vehicles()];

    const search = this.search().trim().toLowerCase();

    if (search) {

      data = data.filter(v =>
        v.plateNumber.toLowerCase().includes(search) ||
        v.brand.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search) ||
        (v.adminName ?? '').toLowerCase().includes(search)
      );

    }

    const availability = this.availabilityFilter();

    if (availability !== 'ALL') {

      data = data.filter(v =>
        this.vehicleStatusMap().get(v.id) === availability
      );

    }

    data.sort((a: any, b: any) => {

      const column = this.sortColumn();

      let valueA = a[column];
      let valueB = b[column];

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return this.sortDirection() === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection() === 'asc' ? 1 : -1;

      return 0;

    });

    return data;

  });

  paginatedVehicles = computed(() => {

    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredVehicles().slice(start, start + this.pageSize());

  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredVehicles().length / this.pageSize()))
  );

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private vehicleService: VehicleService,
    private missionService: MissionService,
    private vehicleDocumentService: VehicleDocumentService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadVehicles();
  }

  // ==========================================================
  // LOAD
  // ==========================================================

  loadVehicles(): void {

    this.loading.set(true);

    forkJoin({
      vehicles: this.vehicleService.getAll(),
      missions: this.missionService.getAll(),
      vehicleDocuments: this.vehicleDocumentService.getAll()
    }).subscribe({

      next: (result) => {

        this.vehicles.set(result.vehicles);
        this.missions.set(result.missions);
        this.vehicleDocuments.set(result.vehicleDocuments);

        this.loading.set(false);

        this.route.queryParams.subscribe(params => {

          const editId = params['edit'];

          if (editId) {

            const vehicle = this.vehicles().find(v => v.id === editId);

            if (vehicle) {

              this.editVehicle(vehicle.id);

              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true
              });

            }

            return;
          }

          const deleteId = params['delete'];

          if (deleteId) {

            const vehicle = this.vehicles().find(v => v.id === deleteId);

            if (vehicle) {

              this.deleteVehicle(vehicle.id);

              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true
              });

            }

          }

        });

        setTimeout(() => feather.replace(), 0);

      },

      error: (err) => {

        console.error(err);

        this.loading.set(false);

        this.toastService.error('Failed to load vehicles');

      }

    });

  }

  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  onSearch(value: string) {

    this.search.set(value);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  filterAvailability(value: 'ALL' | 'AVAILABLE' | 'IN_MISSION') {

    this.availabilityFilter.set(value);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  clearFilters() {

    this.search.set('');

    this.availabilityFilter.set('ALL');

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // SORT
  // ==========================================================

  sort(column: string) {

    if (this.sortColumn() === column) {

      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');

    } else {

      this.sortColumn.set(column);
      this.sortDirection.set('asc');

    }

  }

  // ==========================================================
  // PAGINATION
  // ==========================================================

  nextPage() {

    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(v => v + 1);
    }

  }

  previousPage() {

    if (this.currentPage() > 1) {
      this.currentPage.update(v => v - 1);
    }

  }

  // ==========================================================
  // PHOTOS — new/staged files
  // ==========================================================

  onPhotosSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);

    newFiles.forEach(file => {

      const alreadySelected = this.selectedPhotos().some(
        existing =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (alreadySelected) return;

      this.selectedPhotos.update(list => [...list, file]);

      const reader = new FileReader();

      reader.onload = () => {

        this.photoPreviews.update(list => [...list, reader.result as string]);

        setTimeout(() => feather.replace(), 0);

      };

      reader.readAsDataURL(file);

    });

    input.value = '';

  }

  removeSelectedPhoto(index: number) {

    this.selectedPhotos.update(list => list.filter((_, i) => i !== index));
    this.photoPreviews.update(list => list.filter((_, i) => i !== index));
    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // PHOTOS — already saved on the vehicle (edit mode)
  // ==========================================================

  removeExistingPhoto(vehicleId: string, photoId: string): void {

    this.vehicleService.deletePhoto(vehicleId, photoId).subscribe({

      next: (updatedVehicle) => {

        this.existingPhotos.set(updatedVehicle.photos ?? []);

       // this.toastService.success('Photo removed successfully');

      },

      error: err => {

        console.error(err);

        // this.toastService.error('Failed to remove photo');

      }

    });

  }

  // ==========================================================
  // SAVE VEHICLE (CREATE / UPDATE)
  // ==========================================================

  saveVehicle() {

    this.submitted.set(true);

    if (
      this.plateNumberInvalid ||
      this.brandInvalid ||
      this.modelInvalid ||
      this.yearInvalid
    ) {
      return;
    }

    const vehicle = {
      plateNumber: this.plateNumber.trim().toUpperCase(),
      brand: this.brand.trim(),
      model: this.model.trim(),
      year: this.year
    };

    if (!this.editMode) {

      this.vehicleService.create(vehicle).subscribe({

        next: (createdVehicle) => {

          const photos = this.selectedPhotos();

          if (photos.length > 0) {

            const uploads = photos.map(photo =>
              this.vehicleService.uploadPhoto(createdVehicle.id, photo)
            );

            forkJoin(uploads).subscribe({

              next: () => {

               // this.toastService.success('Vehicle created successfully');

                this.resetForm();

                bootstrap.Modal.getInstance(document.getElementById('vehicleModal'))?.hide();

                this.loadVehicles();

              },

              error: err => {

                console.error(err);

                this.toastService.error('Vehicle created, but some photos failed to upload');

                this.resetForm();

                bootstrap.Modal.getInstance(document.getElementById('vehicleModal'))?.hide();

                this.loadVehicles();

              }

            });

          } else {

           // this.toastService.success('Vehicle created successfully');

            this.resetForm();

            bootstrap.Modal.getInstance(document.getElementById('vehicleModal'))?.hide();

            this.loadVehicles();

          }

        },

        error: err => {

          console.error(err);

          this.toastService.error('Vehicle creation failed');

        }

      });

    } else {

      this.vehicleService.update(this.editingVehicleId!, vehicle).subscribe({

        next: (updatedVehicle) => {

          const photos = this.selectedPhotos();

          if (photos.length > 0) {

            const uploads = photos.map(photo =>
              this.vehicleService.uploadPhoto(updatedVehicle.id, photo)
            );

            forkJoin(uploads).subscribe({

              next: () => {

             //   this.toastService.success('Vehicle updated successfully');

                this.resetForm();

                bootstrap.Modal.getInstance(document.getElementById('vehicleModal'))?.hide();

                this.loadVehicles();

              },

              error: err => {

                console.error(err);

                this.toastService.error('Vehicle updated, but some photos failed to upload');

                this.resetForm();

                bootstrap.Modal.getInstance(document.getElementById('vehicleModal'))?.hide();

                this.loadVehicles();

              }

            });

          } else {

           // this.toastService.success('Vehicle updated successfully');

            this.resetForm();

            bootstrap.Modal.getInstance(document.getElementById('vehicleModal'))?.hide();

            this.loadVehicles();

          }

        },

        error: err => {

          console.error(err);

          this.toastService.error('Vehicle update failed');

        }

      });

    }

  }

  // ==========================================================
  // RESET
  // ==========================================================

  resetForm() {

    this.plateNumber = '';
    this.brand = '';
    this.model = '';
    this.year = new Date().getFullYear();

    this.selectedPhotos.set([]);
    this.photoPreviews.set([]);

    this.existingPhotos.set([]);

    this.editMode = false;
    this.editingVehicleId = null;

    this.submitted.set(false);

    const input = document.getElementById('vehiclePhotosInput') as HTMLInputElement;

    if (input) {
      input.value = '';
    }

  }

  // ==========================================================
  // DETAILS
  // ==========================================================

  viewVehicleDetails(id: string) {
    this.router.navigate(['/vehicles', id]);
  }

  // ==========================================================
  // EDIT
  // ==========================================================

  editVehicle(id: string) {

    const vehicle = this.vehicles().find(v => v.id === id);

    if (!vehicle) return;

    this.editMode = true;
    this.editingVehicleId = id;

    this.submitted.set(false);

    this.plateNumber = vehicle.plateNumber;
    this.brand = vehicle.brand;
    this.model = vehicle.model;
    this.year = vehicle.year;

    this.selectedPhotos.set([]);
    this.photoPreviews.set([]);

    this.existingPhotos.set(vehicle.photos ?? []);

    const modal = new bootstrap.Modal(document.getElementById('vehicleModal'));

    modal.show();

  }

  // ==========================================================
  // DELETE VEHICLE
  // ==========================================================

  deleteVehicle(id: string) {

    this.vehicleToDeleteId.set(id);

    const modal = new bootstrap.Modal(document.getElementById('deleteVehicleModal'));

    modal.show();

  }

  confirmDeleteVehicle() {

    const id = this.vehicleToDeleteId();

    if (!id) return;

    this.vehicleService.delete(id).subscribe({

      next: () => {

        this.loadVehicles();

        this.vehicleToDeleteId.set(null);

        bootstrap.Modal.getInstance(document.getElementById('deleteVehicleModal'))?.hide();

        this.toastService.success('Vehicle deleted successfully');

      },

      error: err => {

        console.error(err);

        bootstrap.Modal.getInstance(document.getElementById('deleteVehicleModal'))?.hide();

        this.toastService.error('Failed to delete vehicle');

        this.vehicleToDeleteId.set(null);

      }

    });

  }

  // ==========================================================
  // REFRESH / CREATE
  // ==========================================================

  refresh() {
    this.loadVehicles();
  }

  openCreateModal() {

    this.editMode = false;
    this.editingVehicleId = null;

    this.resetForm();

    const modal = new bootstrap.Modal(document.getElementById('vehicleModal'));

    modal.show();

  }

}