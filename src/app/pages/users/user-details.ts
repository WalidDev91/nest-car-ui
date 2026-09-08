import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { MissionService } from '../../services/mission.service';
import { DriverDocumentService } from '../../services/driver-document.service';

import { User } from '../../models/user';
import { Mission } from '../../models/mission';
import { DriverDocument } from '../../models/driver-document';

import feather from 'feather-icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails implements OnInit {

  // ==========================
  // STATE
  // ==========================

  user = signal<User | null>(null);

  driverDocs = signal<DriverDocument[]>([]);

  driverMissions = signal<Mission[]>([]);

  selectedTab = signal<'info' | 'documents' | 'missions'>('info');

  loading = signal(false);

  error = signal('');

  // ==========================
  // DRIVER DOCUMENT STATUS
  // ==========================

  hasLicense = signal(false);
  hasIdCard = signal(false);

  // ==========================
  // DRIVER MISSIONS
  // ==========================

  loadingMissions = signal(false);

  // ==========================
  // CURRENT USER
  // ==========================

  userId = '';

  uploadsUrl = environment.uploadsUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private driverDocumentService: DriverDocumentService,
    private missionService: MissionService
  ) { }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.error.set('Invalid user id');

      return;

    }

    this.userId = id;

    this.loadUser();
  }

  // ==========================
  // LOAD USER
  // ==========================

  loadUser(): void {

    this.loading.set(true);
    this.error.set('');

    this.userService.getById(this.userId)
      .subscribe({

        next: user => {

          this.user.set(user);

          this.loading.set(false);

          if (this.isDriver()) {

            this.loadDriverDocs(user.id);
            this.loadDriverMissions(user.id);

          }

          setTimeout(() => {

            feather.replace();

          }, 0);

        },

        error: err => {

          console.error(err);

          this.error.set('Unable to load user information.');

          this.loading.set(false);

        }

      });

  }

  // ==========================
  // DRIVER DOCUMENTS
  // ==========================

  loadDriverDocs(driverId: string): void {

    this.driverDocumentService.getByDriverId(driverId)
      .subscribe({

        next: docs => {

          this.driverDocs.set(docs);

          this.hasLicense.set(
            docs.some(doc => doc.type === 'DRIVER_LICENSE')
          );

          this.hasIdCard.set(
            docs.some(doc => doc.type === 'ID_CARD')
          );

        },

        error: err => {

          console.error(
            'Driver documents error:',
            err
          );

        }

      });

  }

  // ==========================
  // DRIVER MISSIONS
  // ==========================

  loadDriverMissions(driverId: string): void {

    this.loadingMissions.set(true);

    this.missionService.getAll()
      .subscribe({

        next: missions => {

          const filteredMissions = missions
            .filter(mission => mission.driverId === driverId)
            .sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime()
            );

          this.driverMissions.set(filteredMissions);

          this.loadingMissions.set(false);

          setTimeout(() => {
            feather.replace();
          }, 0);

        },

        error: err => {

          console.error(
            'Driver missions error:',
            err
          );

          this.loadingMissions.set(false);

        }

      });

  }

  // ==========================
  // TABS
  // ==========================

  selectTab(
    tab: 'info' | 'documents' | 'missions'
  ): void {

    this.selectedTab.set(tab);

    setTimeout(() => {

      feather.replace();

    }, 0);

  }

  // ==========================
  // HELPERS
  // ==========================

  isDriver(): boolean {

    return this.user()?.role === 'DRIVER';

  }

  isAdmin(): boolean {

    const role = this.user()?.role;

    return role === 'ADMIN'
      || role === 'SUPER_ADMIN';

  }

  hasCompleteDocuments(): boolean {

    return this.hasLicense()
      && this.hasIdCard();

  }

  getMissionStatusClass(status: string): string {

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

  // ==========================
  // NAVIGATION
  // ==========================

  goBack(): void {

    this.router.navigate(['/users']);

  }

  refresh(): void {

    this.loadUser();

  }

  viewDriverDocument(id: string): void {

    this.router.navigate([
      '/documents/driver',
      id
    ]);

  }

  viewMission(id: string): void {

    this.router.navigate([
      '/missions',
      id
    ]);

  }

  // ==========================
  // ACTIONS
  // ==========================

  editUser(): void {

    const user = this.user();

    if (!user) return;

    this.router.navigate(
      ['/users'],
      {
        queryParams: {
          edit: user.id
        }
      }
    );

  }

  deleteUser(): void {

    const user = this.user();

    if (!user) return;

    this.router.navigate(
      ['/users'],
      {
        queryParams: {
          delete: user.id
        }
      }
    );

  }

  activateUser(): void {

    const user = this.user();

    if (!user) return;

    this.userService.activate(user.id).subscribe({

      next: () => {
        this.refresh();
      },

      error: err => {
        console.error(err);
      }

    });

  }

  deactivateUser(): void {

    const user = this.user();

    if (!user) return;

    this.userService.deactivate(user.id).subscribe({

      next: () => {
        this.refresh();
      },

      error: err => {
        console.error(err);
      }

    });

  }

  viewVehicleDocument(id: string): void {

    this.router.navigate([
      '/documents/vehicle',
      id
    ]);

  }

  previewDriverDocument(id: string): void {

    this.driverDocumentService.previewDriverDocument(id).subscribe({

      next: blob => {

        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 60000);

      },

      error: error => {

        console.error(
          'Failed to preview driver document',
          error
        );

      }

    });

  }

}