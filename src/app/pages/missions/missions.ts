import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';
import feather from 'feather-icons';

import { MissionService } from '../../services/mission.service';
import { UserService } from '../../services/user.service';
import { VehicleService } from '../../services/vehicle.service';

import { Mission } from '../../models/mission';
import { User } from '../../models/user';
import { Vehicle } from '../../models/vehicle';

declare var bootstrap: any;

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './missions.html',
  styleUrl: './missions.css'
})
export class Missions implements OnInit {

  // ==========================================================
  // DATA
  // ==========================================================

  missions = signal<Mission[]>([]);
  users = signal<User[]>([]);
  vehicles = signal<Vehicle[]>([]);

  selectedMission = signal<Mission | null>(null);

  loading = signal(false);

  // ==========================================================
  // ROLE
  // ==========================================================

  role = localStorage.getItem('role') ?? '';

  get isDriver() {
    return this.role === 'DRIVER';
  }

  get isFleetManager() {
    return this.role === 'FLEET_MANAGER';
  }

  get isAdmin() {
    return this.role === 'ADMIN';
  }

  get isSuperAdmin() {
    return this.role === 'SUPER_ADMIN';
  }

  missionToDeleteId: string | null = null;

  // ==========================================================
  // SEARCH / FILTER / SORT
  // ==========================================================

  search = signal('');
  statusFilter = signal('ALL');

  sortField = signal<keyof Mission>('startDate');
  sortDirection = signal<'asc' | 'desc'>('desc');

  onSearch(value: string) {
    this.search.set(value);
    this.currentPage.set(1);
    setTimeout(() => feather.replace(), 0);
  }

  filterStatus(value: string) {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    setTimeout(() => feather.replace(), 0);
  }

  sort(field: keyof Mission) {

    if (this.sortField() === field) {

      this.sortDirection.set(
        this.sortDirection() === 'asc'
          ? 'desc'
          : 'asc'
      );

    } else {

      this.sortField.set(field);
      this.sortDirection.set('asc');

    }

    setTimeout(() => feather.replace(), 0);

  }

  filteredMissions = computed(() => {

    let data = [...this.missions()];

    if (this.search().trim()) {

      const s = this.search().toLowerCase();

      data = data.filter(m =>

        m.title.toLowerCase().includes(s) ||

        m.description.toLowerCase().includes(s) ||

        (m.driverName ?? '').toLowerCase().includes(s) ||

        (m.vehiclePlateNumber ?? '').toLowerCase().includes(s)

      );

    }

    if (this.statusFilter() !== 'ALL') {

      data = data.filter(
        m => m.status === this.statusFilter()
      );

    }

    data.sort((a: any, b: any) => {

      const field = this.sortField();

      let v1 = a[field];
      let v2 = b[field];

      if (typeof v1 === 'string') v1 = v1.toLowerCase();
      if (typeof v2 === 'string') v2 = v2.toLowerCase();

      if (v1 < v2)
        return this.sortDirection() === 'asc' ? -1 : 1;

      if (v1 > v2)
        return this.sortDirection() === 'asc' ? 1 : -1;

      return 0;

    });

    return data;

  });

  // ==========================================================
  // PAGINATION
  // ==========================================================

  readonly pageSize = 10;

  currentPage = signal(1);

  totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(
        this.filteredMissions().length / this.pageSize
      )
    )
  );

  paginatedMissions = computed(() => {

    const start =
      (this.currentPage() - 1) * this.pageSize;

    return this.filteredMissions().slice(
      start,
      start + this.pageSize
    );

  });

  previousPage() {

    if (this.currentPage() > 1) {

      this.currentPage.update(v => v - 1);

      setTimeout(() => feather.replace(), 0);

    }

  }

  nextPage() {

    if (this.currentPage() < this.totalPages()) {

      this.currentPage.update(v => v + 1);

      setTimeout(() => feather.replace(), 0);

    }

  }

  // ==========================================================
  // STATISTICS
  // ==========================================================

  totalMissions = computed(() => this.missions().length);

  plannedMissions = computed(() =>
    this.missions().filter(x => x.status === 'PLANNED').length
  );

  ongoingMissions = computed(() =>
    this.missions().filter(x => x.status === 'ONGOING').length
  );

  completedMissions = computed(() =>
    this.missions().filter(x => x.status === 'COMPLETED').length
  );

  cancelledMissions = computed(() =>
    this.missions().filter(x => x.status === 'CANCELLED').length
  );

  // ==========================================================
  // MODAL + FORM
  // ==========================================================

  showModal = false;
  editMode = false;

  title = '';
  description = '';
  startDate = '';
  endDate = '';

  status:
    | 'PLANNED'
    | 'ONGOING'
    | 'COMPLETED'
    | 'CANCELLED'
    = 'PLANNED';

  driverId: string | null = null;
  vehicleId: string | null = null;

  constructor(
    private missionService: MissionService,
    private userService: UserService,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.loadMissions();

  }

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  loadMissions(): void {

    this.loading.set(true);

    forkJoin({

      missions: this.missionService.getAll(),

      users: this.userService.getAll(),

      vehicles: this.vehicleService.getAll()

    }).subscribe({

      next: ({ missions, users, vehicles }) => {

        this.missions.set(missions);

        this.users.set(users);

        this.vehicles.set(vehicles);

        this.loading.set(false);

        this.route.queryParams.subscribe(params => {

          // =========================
          // EDIT
          // =========================

          const editId = params['edit'];

          if (editId) {

            const mission = this.missions().find(m => m.id === editId);

            if (mission) {

              this.openEditModal(mission);

              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true
              });

            }

            return;

          }

          // =========================
          // DELETE
          // =========================

          const deleteId = params['delete'];

          if (deleteId) {

            const mission = this.missions().find(m => m.id === deleteId);

            if (mission) {

              this.deleteMission(mission.id);

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

      error: err => {

        console.error(err);

        this.loading.set(false);

      }

    });

  }

  refresh() {

    this.loadMissions();

  }

  // ==========================================================
  // DROPDOWNS
  // ==========================================================

  driversList() {
    return this.users().filter(
      u => u.role === 'DRIVER'
    );
  }

  vehiclesList() {
    return this.vehicles();
  }

  // ==========================================================
  // CREATE / EDIT
  // ==========================================================

  openCreateModal() {

    this.editMode = false;

    this.selectedMission.set(null);

    this.resetForm();

    const modal = new bootstrap.Modal(
      document.getElementById('missionModal')
    );

    modal.show();

  }

  openEditModal(mission: Mission) {

    this.editMode = true;

    this.selectedMission.set(mission);

    this.title = mission.title;

    this.description = mission.description;

    this.startDate = mission.startDate;

    this.endDate = mission.endDate;

    this.status = mission.status;

    this.driverId = mission.driverId ?? '';

    this.vehicleId = mission.vehicleId ?? '';

    const modal = new bootstrap.Modal(
      document.getElementById('missionModal')
    );

    modal.show();

  }

  closeModal() {

    this.selectedMission.set(null);

    this.resetForm();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById('missionModal')
    );

    modal?.hide();

  }

  // ==========================================================
  // CREATE
  // ==========================================================

  createMission() {

    const request = {

      title: this.title,

      description: this.description,

      startDate: this.startDate,

      endDate: this.endDate,

      status: this.status,

      driverId: this.driverId || null,

      vehicleId: this.vehicleId || null

    };

    if (this.editMode && this.selectedMission()) {

      this.missionService

        .update(
          this.selectedMission()!.id,
          request
        )

        .subscribe({

          next: () => {

            this.loadMissions();

            this.closeModal();

          },

          error: err => console.error(err)

        });

      return;

    }

    this.missionService

      .create(request)

      .subscribe({

        next: () => {

          this.loadMissions();

          this.closeModal();

        },

        error: err => console.error(err)

      });

  }

  // ==========================================================
  // DELETE
  // ==========================================================

  deleteMission(id: string) {

    this.missionToDeleteId = id;

    const modal = new bootstrap.Modal(
      document.getElementById('deleteMissionModal')
    );

    modal.show();

  }

  confirmDeleteMission() {

    if (!this.missionToDeleteId) return;

    this.missionService.delete(this.missionToDeleteId).subscribe({

      next: () => {

        this.loadMissions();

        this.missionToDeleteId = null;

        bootstrap.Modal
          .getInstance(document.getElementById('deleteMissionModal'))
          ?.hide();

      },

      error: err => {

        console.error(err);

        this.missionToDeleteId = null;

        bootstrap.Modal
          .getInstance(document.getElementById('deleteMissionModal'))
          ?.hide();

      }

    });

  }

  // ==========================================================
  // DETAILS
  // ==========================================================

  viewMissionDetails(id: string) {

    this.router.navigate([
      '/missions',
      id
    ]);

  }

  // ==========================================================
  // RESET FORM
  // ==========================================================

  resetForm() {

    this.title = '';

    this.description = '';

    this.startDate = '';

    this.endDate = '';

    this.status = 'PLANNED';

    this.driverId = '';

    this.vehicleId = '';

  }

  // ==========================================================
  // STATUS BADGES
  // ==========================================================

  getStatusClass(status: string): string {

    switch (status) {

      case 'PLANNED':
        return 'bg-warning';

      case 'ONGOING':
        return 'bg-primary';

      case 'COMPLETED':
        return 'bg-success';

      case 'CANCELLED':
        return 'bg-danger';

      default:
        return 'bg-secondary';

    }

  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  trackByMission(index: number, mission: Mission) {

    return mission.id;

  }

  driverName(id: string | null | undefined): string {

    if (!id) {

      return '';

    }

    const driver = this.users().find(u => u.id === id);

    return driver
      ? `${driver.firstName} ${driver.lastName}`
      : '';

  }

  vehicleName(id: string | null | undefined): string {

    if (!id) {

      return '';

    }

    const vehicle = this.vehicles().find(v => v.id === id);

    return vehicle
      ? `${vehicle.plateNumber} • ${vehicle.brand}`
      : '';

  }
}