import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AdministrationService } from '../../services/administration.service'
import feather from 'feather-icons';


@Component({
  selector: 'app-administration',
  imports: [CommonModule, FormsModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {

  users = signal<User[]>([]);
  pendingRequests = signal<User[]>([]);
  auditLogs = signal<any[]>([]);

  loading = signal(false);

  selectedTab = signal<'users' | 'requests' | 'settings' | 'audit'>('users');

  settings = {
    applicationName: '',
    language: 'EN',
    sessionTimeout: 30
  };

  constructor(
    private userService: UserService,
    private administrationService: AdministrationService
  ) { }

  ngOnInit(): void {

    this.loadUsers();
    this.loadPendingRequests();
    this.loadAuditLogs();

  }

  selectTab(tab: 'users' | 'requests' | 'settings' | 'audit') {

    this.selectedTab.set(tab);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================
  // USERS
  // ==========================

  loadUsers(): void {

    this.loading.set(true);

    this.userService.getAll().subscribe({

      next: users => {

        this.users.set(users);

        this.loading.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.loading.set(false);

      }

    });

  }

  // ==========================
  // ACCOUNT REQUESTS
  // ==========================

  loadPendingRequests(): void {

    this.administrationService.getPendingRequests().subscribe({

      next: data => {

        this.pendingRequests.set(data);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => console.error(err)

    });

  }

  approveRequest(userId: string): void {

    this.administrationService.approveRequest(userId).subscribe({

      next: () => {

        this.loadPendingRequests();
        this.loadUsers();

      }

    });

  }

  rejectRequest(userId: string): void {

    this.administrationService.rejectRequest(userId).subscribe({

      next: () => this.loadPendingRequests()

    });

  }

  // ==========================
  // USER MANAGEMENT
  // ==========================

  activateUser(userId: string): void {

    this.userService.activate(userId).subscribe({

      next: () => this.loadUsers()

    });

  }

  deactivateUser(userId: string): void {

    this.userService.deactivate(userId).subscribe({

      next: () => this.loadUsers()

    });

  }

  changeRole(userId: string, role: string): void {

    this.userService.changeRole(userId, role).subscribe({

      next: () => this.loadUsers()

    });

  }

  deleteUser(userId: string): void {

    if (!confirm('Delete this user ?')) return;

    this.userService.delete(userId).subscribe({

      next: () => this.loadUsers()

    });

  }

  // ==========================
  // AUDIT LOGS
  // ==========================

  loadAuditLogs(): void {

    this.administrationService.getAuditLogs().subscribe({

      next: logs => {

        this.auditLogs.set(logs);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => console.error(err)

    });

  }

  saveSettings(): void {

    this.administrationService.saveSettings(this.settings)
      .subscribe({

        next: () => {
          console.log('Settings saved');
        },

        error: err => {
          console.error(err);
        }

      });

  }

}