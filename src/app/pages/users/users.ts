import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';


@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  // ==========================================================
  // STATE
  // ==========================================================

  loading = signal(false);

  users = signal<User[]>([]);

  search = signal('');

  selectedRole = signal('ALL');

  selectedStatus = signal('ALL');

  sortColumn = signal('firstName');

  sortDirection = signal<'asc' | 'desc'>('asc');

  currentPage = signal(1);

  pageSize = 10;

  // ==========================================================
  // STATISTICS
  // ==========================================================

  totalUsers = computed(() =>
    this.users().length
  );

  activeUsers = computed(() =>
    this.users().filter(u => u.isValidate).length
  );

  inactiveUsers = computed(() =>
    this.users().filter(u => !u.isValidate).length
  );

  admins = computed(() =>
    this.users().filter(u =>
      u.role === 'ADMIN' ||
      u.role === 'SUPER_ADMIN'
    ).length
  );

  drivers = computed(() =>
    this.users().filter(u =>
      u.role === 'DRIVER'
    ).length
  );

  fleetManagers = computed(() =>
    this.users().filter(u =>
      u.role === 'FLEET_MANAGER'
    ).length
  );

  // ==========================================================
  // FILTERING
  // ==========================================================

  filteredUsers = computed(() => {

    let result = [...this.users()];

    const keyword = this.search().trim().toLowerCase();

    if (keyword) {

      result = result.filter(user =>

        user.firstName.toLowerCase().includes(keyword) ||

        user.lastName.toLowerCase().includes(keyword) ||

        user.email.toLowerCase().includes(keyword) ||

        (user.phone ?? '').toLowerCase().includes(keyword)

      );

    }

    if (this.selectedRole() !== 'ALL') {

      result = result.filter(user =>
        user.role === this.selectedRole()
      );

    }

    if (this.selectedStatus() !== 'ALL') {

      result = result.filter(user =>

        this.selectedStatus() === 'ACTIVE'
          ? user.isValidate
          : !user.isValidate

      );

    }

    result.sort((a: any, b: any) => {

      const column = this.sortColumn();

      const valueA = a[column];
      const valueB = b[column];

      if (valueA == null) return -1;
      if (valueB == null) return 1;

      const comparison =
        valueA.toString().localeCompare(valueB.toString());

      return this.sortDirection() === 'asc'
        ? comparison
        : -comparison;

    });

    return result;

  });

  // ==========================================================
  // PAGINATION
  // ==========================================================

  totalPages = computed(() =>
    Math.ceil(
      this.filteredUsers().length / this.pageSize
    )
  );

  paginatedUsers = computed(() => {

    const start =
      (this.currentPage() - 1) * this.pageSize;

    return this.filteredUsers().slice(
      start,
      start + this.pageSize
    );

  });

  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    this.loadUsers();

  }

  loadUsers() {

    this.loading.set(true);

    this.userService.getAll().subscribe({

      next: users => {

        this.users.set(users);

        this.loading.set(false);

        setTimeout(() =>
          feather.replace(),
          0
        );

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
  // FILTERS
  // ==========================================================

  filterRole(role: string) {

    this.selectedRole.set(role);

    this.currentPage.set(1);

    setTimeout(() => feather.replace(), 0);

  }

  filterStatus(status: string) {

    this.selectedStatus.set(status);

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

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================================================
  // PAGINATION
  // ==========================================================

  nextPage() {

    if (this.currentPage() < this.totalPages()) {

      this.currentPage.update(v => v + 1);

      setTimeout(() => feather.replace(), 0);

    }

  }

  previousPage() {

    if (this.currentPage() > 1) {

      this.currentPage.update(v => v - 1);

      setTimeout(() => feather.replace(), 0);

    }

  }

  // ==========================================================
  // DETAILS
  // ==========================================================

  viewDetails(id: string) {

    this.router.navigate(['/users', id]);

  }

  // ==========================================================
  // ACTIONS
  // (backend next)
  // ==========================================================

  createUser() {

    console.log('create user');

  }

  editUser(user: User) {

    console.log(user);

  }

  activateUser(user: User) {

    console.log(user);

  }

  deactivateUser(user: User) {

    console.log(user);

  }

  changeRole(user: User) {

    console.log(user);

  }

  deleteUser(user: User) {

    if (!confirm(
      `Delete ${user.firstName} ${user.lastName}?`
    )) {
      return;
    }

    console.log(user);

  }
}