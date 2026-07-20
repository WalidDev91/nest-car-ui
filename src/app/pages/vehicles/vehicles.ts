import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';

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

  plateNumber = '';
  brand = '';
  model = '';
  year = new Date().getFullYear();

  // Vehicle picture
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // ==========================================================
  // CARDS
  // ==========================================================

  totalVehicles = computed(() =>
    this.vehicles().length
  );

  brandsCount = computed(() =>
    new Set(this.vehicles().map(v => v.brand)).size
  );

  newestVehicle = computed(() => {

    if (!this.vehicles().length) return '-';

    return Math.max(...this.vehicles().map(v => v.year));

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

  loadVehicles() {

    this.loading.set(true);

    this.vehicleService.getAll().subscribe({

      next: data => {

        this.vehicles.set(data);

        this.loading.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

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
  // CREATE
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

    // Image upload will be added in backend.
    // For now we create the vehicle normally.

    this.vehicleService.create(vehicle).subscribe({

      next: () => {

        this.loadVehicles();

        this.resetForm();

        bootstrap.Modal
          .getInstance(
            document.getElementById('createVehicleModal')
          )
          ?.hide();

      },

      error: err => {

        console.error(err);

        alert('Vehicle creation failed.');

      }

    });

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

    console.log('Edit vehicle:', id);

    // Backend next

  }

  // ==========================================================
  // DELETE
  // ==========================================================

  deleteVehicle(id: string) {

    if (!confirm('Delete this vehicle?')) return;

    console.log('Delete vehicle:', id);

    // Backend next

  }

  // ==========================================================
  // REFRESH
  // ==========================================================

  refresh() {

    this.loadVehicles();

  }

}
