import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionService } from '../../services/mission.service';
import { forkJoin } from 'rxjs';

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
  // SEARCH
  // ==========================================================

  search = signal('');

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
  // CREATE FORM
  // ==========================================================

  editMode = false;

  editingVehicleId: string | null = null;

  plateNumber = '';
  brand = '';
  model = '';
  year = new Date().getFullYear();

  // Vehicle picture
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  role = localStorage.getItem('role') ?? '';

  get isDriver() {
    return this.role === 'DRIVER';
  }

  vehicleToDeleteId: string | null = null;


  // ==========================================================
  // CARDS
  // ==========================================================

  totalVehicles = computed(() =>
    this.vehicles().length
  );

  vehiclesInMission = computed(() => {

    const activeVehicleIds = new Set(
      this.missions()
        .filter(m => m.status === 'ONGOING')
        .map(m => m.vehicleId)
    );

    return this.vehicles()
      .filter(v => activeVehicleIds.has(v.id))
      .length;

  });

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

  vehicleStatusMap = computed(() => {

    const ongoingVehicleIds = new Set(
      this.missions()
        .filter(m => m.status === 'ONGOING')
        .map(m => m.vehicleId)
    );

    const map = new Map<string, 'IN_MISSION' | 'AVAILABLE'>();

    this.vehicles().forEach(v => {
      map.set(
        v.id,
        ongoingVehicleIds.has(v.id) ? 'IN_MISSION' : 'AVAILABLE'
      );
    });

    return map;

  });

  // ==========================================================
  // FILTERED
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

    data.sort((a: any, b: any) => {

      const column = this.sortColumn();

      let valueA = a[column];
      let valueB = b[column];

      if (typeof valueA === 'string')
        valueA = valueA.toLowerCase();

      if (typeof valueB === 'string')
        valueB = valueB.toLowerCase();

      if (valueA < valueB)
        return this.sortDirection() === 'asc' ? -1 : 1;

      if (valueA > valueB)
        return this.sortDirection() === 'asc' ? 1 : -1;

      return 0;

    });

    return data;

  });

  paginatedVehicles = computed(() => {

    const start =
      (this.currentPage() - 1) * this.pageSize();

    return this.filteredVehicles().slice(
      start,
      start + this.pageSize()
    );

  });

  totalPages = computed(() =>

    Math.max(
      1,
      Math.ceil(
        this.filteredVehicles().length /
        this.pageSize()
      )
    )

  );

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private vehicleService: VehicleService,
    private missionService: MissionService,
    private vehicleDocumentService: VehicleDocumentService,
    private router: Router
  ) { }

  // ==========================================================
  // INIT
  // ==========================================================

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

        setTimeout(() => feather.replace(), 0);

      },

      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }

    });

  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  onSearch(value: string) {

    this.search.set(value);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // SORT
  // ==========================================================

  sort(column: string) {

    if (this.sortColumn() === column) {

      this.sortDirection.set(

        this.sortDirection() === 'asc'
          ? 'desc'
          : 'asc'

      );

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
  // IMAGE
  // ==========================================================

  onImageSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.selectedImage = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview = reader.result as string;

    };

    reader.readAsDataURL(this.selectedImage);

  }
  // ==========================================================
  // SAVE VEHICLE (CREATE / UPDATE)
  // ==========================================================

  createVehicle() {

    if (
      !this.plateNumber.trim() ||
      !this.brand.trim() ||
      !this.model.trim()
    ) {

      alert('Please fill all required fields.');

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


          if (this.selectedImage) {

            this.vehicleService.uploadImage(
              createdVehicle.id,
              this.selectedImage
            )
              .subscribe({

                next: () => {

                  this.loadVehicles();

                },

                error: err => {

                  console.error(err);

                  alert('Image upload failed');

                }

              });

          }
          else {

            this.loadVehicles();

          }


          this.resetForm();



          bootstrap.Modal
            .getInstance(document.getElementById('vehicleModal'))
            ?.hide();


        },

        error: err => {

          console.error(err);

          alert('Vehicle creation failed.');

        }

      });

    }

    else {

      this.vehicleService.update(this.editingVehicleId!, vehicle).subscribe({

        next: (updatedVehicle) => {


          if (this.selectedImage) {

            this.vehicleService.uploadImage(
              updatedVehicle.id,
              this.selectedImage
            )
              .subscribe({

                next: () => {

                  this.loadVehicles();

                },

                error: err => {

                  console.error(err);

                  alert('Image upload failed');

                }

              });

          }
          else {

            this.loadVehicles();

          }


          this.resetForm();


          this.editMode = false;

          this.editingVehicleId = null;


          bootstrap.Modal
            .getInstance(document.getElementById('vehicleModal'))
            ?.hide();


        },

        error: err => {

          console.error(err);

          alert('Vehicle update failed.');

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

    this.selectedImage = null;

    this.imagePreview = null;

    this.editMode = false;

    this.editingVehicleId = null;

    const input = document.getElementById(
      'vehicleImageInput'
    ) as HTMLInputElement;

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

    this.plateNumber = vehicle.plateNumber;

    this.brand = vehicle.brand;

    this.model = vehicle.model;

    this.year = vehicle.year;

    this.imagePreview = vehicle.imageUrl
      ? 'http://localhost:8080/uploads/vehicles/' + vehicle.imageUrl
      : null;

    this.selectedImage = null;

    const modal = new bootstrap.Modal(
      document.getElementById('vehicleModal')
    );

    modal.show();

  }

  // ==========================================================
  // DELETE
  // ==========================================================

  deleteVehicle(id: string) {

    this.vehicleToDeleteId = id;

    const modal = new bootstrap.Modal(
      document.getElementById('deleteVehicleModal')
    );

    modal.show();

  }

  confirmDeleteVehicle() {

    if (!this.vehicleToDeleteId) return;

    this.vehicleService.delete(this.vehicleToDeleteId).subscribe({

      next: () => {

        this.loadVehicles();

        this.vehicleToDeleteId = null;

        bootstrap.Modal
          .getInstance(document.getElementById('deleteVehicleModal'))
          ?.hide();

      },

      error: err => {

        console.error(err);

        this.vehicleToDeleteId = null;

        bootstrap.Modal
          .getInstance(document.getElementById('deleteVehicleModal'))
          ?.hide();

        alert('Delete failed.');

      }

    });

  }

  // ==========================================================
  // REFRESH
  // ==========================================================

  refresh() {

    this.loadVehicles();

  }

  openCreateModal() {

    this.editMode = false;

    this.editingVehicleId = null;

    this.resetForm();

    const modal = new bootstrap.Modal(
      document.getElementById('vehicleModal')
    );

    modal.show();

  }

}