import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

declare var bootstrap: any;

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

  selectedUser: User | null = null;

  selectedSupervisorId = '';

  selectedRoleValue = '';

  actionType: 'ACTIVATE' | 'DEACTIVATE' | null = null;

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
      u.role === 'ADMIN'
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

  supervisors = computed(() =>
    this.users().filter(u =>
      u.role === 'SUPER_ADMIN' ||
      u.role === 'ADMIN' ||
      u.role === 'FLEET_MANAGER'
    )
  );

  // ==========================================================
  // FILTERING
  // ==========================================================

  hasActiveFilters = computed(() =>
    this.search().trim().length > 0 ||
    this.selectedRole() !== 'ALL' ||
    this.selectedStatus() !== 'ALL'
  );

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

  clearFilters() {

    this.search.set('');
    this.selectedRole.set('ALL');
    this.selectedStatus.set('ALL');
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

  openStatusModal(user: User) {

    this.selectedUser = user;

    this.actionType = user.isValidate
      ? 'DEACTIVATE'
      : 'ACTIVATE';


    const modalElement =
      document.getElementById('statusModal');


    if (!modalElement) {
      return;
    }


    const modal = new bootstrap.Modal(
      modalElement
    );


    modal.show();

  }

  confirmStatusChange() {


    if (!this.selectedUser || !this.actionType) {
      return;
    }


    const request =
      this.actionType === 'ACTIVATE'
        ? this.userService.activate(this.selectedUser.id)
        : this.userService.deactivate(this.selectedUser.id);



    request.subscribe({


      next: () => {


        const modalElement =
          document.getElementById('statusModal');


        if (modalElement) {

          bootstrap.Modal
            .getInstance(modalElement)
            ?.hide();

        }



        this.loadUsers();



        this.selectedUser = null;

        this.actionType = null;


      },



      error: err => {

        console.error(err);

      }


    });


  }

  changeRole(user: User) {

    this.selectedUser = user;

    this.selectedRoleValue = user.role;

    const modal = new bootstrap.Modal(
      document.getElementById('roleModal')
    );

    modal.show();

  }

  saveRoleChange() {

    if (!this.selectedUser) {
      return;
    }


    this.userService.changeRole(
      this.selectedUser.id,
      this.selectedRoleValue
    )
      .subscribe({

        next: () => {

          bootstrap.Modal
            .getInstance(
              document.getElementById('roleModal')
            )
            ?.hide();


          this.loadUsers();


          this.selectedUser = null;

          this.selectedRoleValue = '';

        },


        error: err => {

          console.error(err);

          alert('Role update failed');

        }

      });

  }

  deleteUser(user: User) {

    if (!confirm(
      `Delete ${user.firstName} ${user.lastName}?`
    )) {
      return;
    }

    this.userService.delete(user.id).subscribe({

      next: () => {
        alert('User deleted');
        this.loadUsers();
      },

      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }

    });

  }



  editSupervisorModal(user: any) {

    this.selectedUser = user;

    this.selectedSupervisorId = user.adminId ?? '';

    const modal = new bootstrap.Modal(
      document.getElementById('supervisorModal')
    );

    modal.show();
  }

  saveSupervisor() {

    if (!this.selectedUser) {
      alert('No user selected');
      return;
    }

    if (!this.selectedSupervisorId) {
      alert('Please select a supervisor');
      return;
    }

    this.userService.assignSupervisor(
      this.selectedUser.id,
      this.selectedSupervisorId
    ).subscribe({

      next: () => {

        bootstrap.Modal.getInstance(
          document.getElementById('supervisorModal')
        )?.hide();

        this.loadUsers();

        this.selectedUser = null;
        this.selectedSupervisorId = '';

      },

      error: err => {

        console.error(err);

        alert('Failed to update supervisor');

      }

    });

  }
}