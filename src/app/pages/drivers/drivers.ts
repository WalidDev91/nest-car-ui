import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import feather from 'feather-icons';

import { UserService } from '../../services/user.service';
import { MissionService } from '../../services/mission.service';
import { DriverDocumentService } from '../../services/driver-document.service';
import { ToastService } from '../../services/toast.service';

import { User } from '../../models/user';
import { Mission } from '../../models/mission';
import { DriverDocument } from '../../models/driver-document';

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css'
})
export class Drivers implements OnInit {

  // ==========================
  // STATE
  // ==========================

  users = signal<User[]>([]);
  missions = signal<Mission[]>([]);
  driverDocuments = signal<DriverDocument[]>([]);

  loading = signal(false);

  // ==========================
  // SEARCH / FILTER / SORT
  // ==========================

  search = signal('');
  availabilityFilter = signal<'ALL' | 'AVAILABLE' | 'ON_MISSION'>('ALL');
  eligibilityFilter = signal<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');

  hasActiveFilters = computed(() =>
    this.search().trim().length > 0 ||
    this.availabilityFilter() !== 'ALL' ||
    this.eligibilityFilter() !== 'ALL'
  );

  sortField = signal<'name' | 'availability' | 'nextMission'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  onSearch(value: string) {
    this.search.set(value);
    this.currentPage.set(1);
    setTimeout(() => feather.replace(), 0);
  }

  filterAvailability(value: string) {
    this.availabilityFilter.set(value as any);
    this.currentPage.set(1);
    setTimeout(() => feather.replace(), 0);
  }

  filterEligibility(value: string) {
    this.eligibilityFilter.set(value as any);
    this.currentPage.set(1);
    setTimeout(() => feather.replace(), 0);
  }

  clearFilters() {
    this.search.set('');
    this.availabilityFilter.set('ALL');
    this.eligibilityFilter.set('ALL');
    this.currentPage.set(1);
    setTimeout(() => feather.replace(), 0);
  }

  sort(field: 'name' | 'availability' | 'nextMission') {

    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================
  // DRIVERS LIST
  // ==========================

  drivers = computed(() =>
    this.users().filter(u => u.role === 'DRIVER')
  );

  // ==========================
  // FILTERED + SORTED
  // ==========================

  filteredDrivers = computed(() => {

    let data = [...this.drivers()];

    if (this.search().trim()) {

      const s = this.search().toLowerCase();

      data = data.filter(d =>
        d.firstName.toLowerCase().includes(s) ||
        d.lastName.toLowerCase().includes(s) ||
        d.email.toLowerCase().includes(s) ||
        (d.phone ?? '').toLowerCase().includes(s)
      );

    }

    if (this.availabilityFilter() !== 'ALL') {
      data = data.filter(d => this.getAvailability(d) === this.availabilityFilter());
    }

    if (this.eligibilityFilter() !== 'ALL') {
      data = data.filter(d =>
        this.eligibilityFilter() === 'ELIGIBLE' ? this.isEligible(d) : !this.isEligible(d)
      );
    }

    data.sort((a, b) => {

      const field = this.sortField();

      let v1: any;
      let v2: any;

      if (field === 'name') {
        v1 = `${a.firstName} ${a.lastName}`.toLowerCase();
        v2 = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (field === 'availability') {
        v1 = this.getAvailability(a);
        v2 = this.getAvailability(b);
      } else {
        const nextA = this.getNextMission(a);
        const nextB = this.getNextMission(b);
        v1 = nextA ? new Date(nextA.startDate).getTime() : Infinity;
        v2 = nextB ? new Date(nextB.startDate).getTime() : Infinity;
      }

      if (v1 < v2) return this.sortDirection() === 'asc' ? -1 : 1;
      if (v1 > v2) return this.sortDirection() === 'asc' ? 1 : -1;

      return 0;

    });

    return data;

  });

  // ==========================
  // PAGINATION
  // ==========================

  readonly pageSize = 10;

  currentPage = signal(1);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDrivers().length / this.pageSize))
  );

  paginatedDrivers = computed(() => {

    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredDrivers().slice(start, start + this.pageSize);

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

  // ==========================
  // STATISTICS
  // ==========================

  totalDrivers = computed(() => this.drivers().length);

  availableCount = computed(() =>
    this.drivers().filter(d => this.getAvailability(d) === 'AVAILABLE').length
  );

  onMissionCount = computed(() =>
    this.drivers().filter(d => this.getAvailability(d) === 'ON_MISSION').length
  );

  ineligibleCount = computed(() =>
    this.drivers().filter(d => !this.isEligible(d)).length
  );

  // ==========================
  // INIT / LOAD
  // ==========================

  constructor(
    private userService: UserService,
    private missionService: MissionService,
    private driverDocumentService: DriverDocumentService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {

    this.loading.set(true);

    forkJoin({
      users: this.userService.getAll(),
      missions: this.missionService.getAll(),
      driverDocuments: this.driverDocumentService.getAll()
    }).subscribe({

      next: ({ users, missions, driverDocuments }) => {

        this.users.set(users);
        this.missions.set(missions);
        this.driverDocuments.set(driverDocuments);

        this.loading.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.loading.set(false);

        this.toastService.error('Failed to load drivers');

      }

    });

  }

  refresh() {
    this.loadDrivers();
  }

  // ==========================
  // AVAILABILITY
  // ==========================

  getCurrentMission(driver: User): Mission | undefined {

    const now = new Date();

    return this.missions().find(m =>
      m.driverId === driver.id &&
      m.status !== 'CANCELLED' &&
      new Date(m.startDate) <= now &&
      new Date(m.endDate) >= now
    );

  }

  getNextMission(driver: User): Mission | undefined {

    const now = new Date();

    return this.missions()
      .filter(m =>
        m.driverId === driver.id &&
        m.status === 'PLANNED' &&
        new Date(m.startDate) > now
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  }

  getAvailability(driver: User): 'AVAILABLE' | 'ON_MISSION' {
    return this.getCurrentMission(driver) ? 'ON_MISSION' : 'AVAILABLE';
  }

  getAvailabilityClass(driver: User): string {
    return this.getAvailability(driver) === 'ON_MISSION' ? 'bg-primary' : 'bg-success';
  }

  getAvailabilityLabel(driver: User): string {
    return this.getAvailability(driver) === 'ON_MISSION' ? 'On Mission' : 'Available';
  }

  // ==========================
  // ELIGIBILITY
  // ==========================

  private isValidDoc(doc: DriverDocument | undefined): boolean {
    return !!doc && doc.status === 'APPROVED' && new Date(doc.expiryDate) >= new Date();
  }

  isEligible(driver: User): boolean {

    const docs = this.driverDocuments().filter(d => d.driverId === driver.id);

    const license = docs.find(d => d.type === 'DRIVER_LICENSE');
    const idCard = docs.find(d => d.type === 'ID_CARD');

    return this.isValidDoc(license) && this.isValidDoc(idCard);

  }

  eligibilityReason(driver: User): string {

    if (this.isEligible(driver)) {
      return 'All documents approved and valid';
    }

    const now = new Date();

    const docs = this.driverDocuments().filter(d => d.driverId === driver.id);

    const license = docs.find(d => d.type === 'DRIVER_LICENSE');
    const idCard = docs.find(d => d.type === 'ID_CARD');

    const issues: string[] = [];

    if (!license) issues.push('missing driver license');
    else if (license.status !== 'APPROVED') issues.push('driver license not approved');
    else if (new Date(license.expiryDate) < now) issues.push('driver license expired');

    if (!idCard) issues.push('missing ID card');
    else if (idCard.status !== 'APPROVED') issues.push('ID card not approved');
    else if (new Date(idCard.expiryDate) < now) issues.push('ID card expired');

    return issues.join(', ');

  }

  // ==========================
  // HELPERS
  // ==========================

  trackByDriver(index: number, driver: User) {
    return driver.id;
  }

  viewDetails(id: string) {
    this.router.navigate(['/users', id]);
  }

}