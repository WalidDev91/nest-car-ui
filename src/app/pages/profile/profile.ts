import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { User } from '../../models/user';
import { DriverDocument } from '../../models/driver-document';
import { UserRequest } from '../../models/user-request';
import { UserService } from '../../services/user.service';
import { DriverDocumentService } from '../../services/driver-document.service';
import { UserRequestService } from '../../services/user-request.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  @ViewChild('profilePictureInput')
  profilePictureInput!: ElementRef<HTMLInputElement>;

  // ==========================
  // PAGE STATE
  // ==========================

  loading = signal(false);
  error = signal<string | null>(null);

  selectedTab = signal<'info' | 'security' | 'documents' | 'requests'>('info');

  // ==========================
  // CURRENT USER
  // ==========================

  user = signal<User | null>(null);

  userId = localStorage.getItem('userId') ?? '';

  uploadsUrl = environment.uploadsUrl;

  // ==========================
  // PROFILE FORM
  // ==========================

  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  // ==========================
  // PASSWORD FORM
  // ==========================

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // ==========================
  // DRIVER DOCUMENTS
  // ==========================

  driverDocs = signal<DriverDocument[]>([]);

  // ==========================
  // REQUESTS
  // ==========================

  requests = signal<UserRequest[]>([]);

  loadingRequests = signal(false);

  showRequestForm = signal(false);

  requestForm = {
    type: '',
    subject: '',
    description: ''
  };

  constructor(
    private userService: UserService,
    private driverDocumentService: DriverDocumentService,
    private userRequestService: UserRequestService
  ) { }

  ngOnInit(): void {
    this.loadUser();
    this.loadMyRequests();
  }

  // ==========================
  // LOAD CURRENT USER
  // ==========================

  loadUser(): void {

    if (!this.userId) {
      this.error.set('Unable to identify the current user.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.userService.getById(this.userId).subscribe({

      next: user => {

        this.user.set(user);

        this.resetProfileForm();

        this.loading.set(false);

        if (this.isDriver()) {
          this.loadDriverDocs(user.id);
        }

      },

      error: err => {

        console.error(err);

        this.error.set('Unable to load your profile.');

        this.loading.set(false);

      }

    });

  }

  // ==========================
  // DRIVER DOCUMENTS
  // ==========================

  loadDriverDocs(driverId: string): void {

    this.driverDocumentService.getByDriverId(driverId).subscribe({

      next: docs => {
        this.driverDocs.set(docs);
      },

      error: err => {
        console.error('Driver documents error:', err);
      }

    });

  }

  // ==========================
  // TABS
  // ==========================

  selectTab(
    tab: 'info' | 'security' | 'documents' | 'requests'
  ): void {
    this.selectedTab.set(tab);
  }

  // ==========================
  // ROLE
  // ==========================

  isDriver(): boolean {
    return this.user()?.role === 'DRIVER';
  }

  // ==========================
  // PROFILE PICTURE
  // ==========================

  openPictureSelector(): void {
    this.profilePictureInput?.nativeElement.click();
  }

  onProfilePictureSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {

      return;
    }

    this.userService.uploadImage(this.userId, file).subscribe({

      next: updatedUser => {

        this.user.set(updatedUser);



      },

      error: err => {

        console.error(err);



      }

    });

  }

  // ==========================
  // PROFILE EDIT
  // ==========================

  resetProfileForm(): void {

    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.editForm = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: currentUser.phone ?? ''
    };

  }

  saveProfile(): void {

    if (
      !this.editForm.firstName.trim() ||
      !this.editForm.lastName.trim() ||
      !this.editForm.email.trim()
    ) {

      return;
    }

    this.userService.updateProfile(this.editForm).subscribe({

      next: updatedUser => {

        this.user.set(updatedUser);



      },

      error: err => {

        console.error(err);



      }

    });

  }

  // ==========================
  // PASSWORD
  // ==========================

  changePassword(): void {

    if (
      !this.passwordForm.currentPassword ||
      !this.passwordForm.newPassword ||
      !this.passwordForm.confirmPassword
    ) {
      this.error.set('Please fill in all password fields.');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.error.set('New passwords do not match.');
      return;
    }

    this.error.set(null);

    this.userService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({

      next: () => {

        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };



      },

      error: err => {

        console.error(err);

        if (err.status === 401) {
          this.error.set('Current password is incorrect.');
        } else {

        }

      }

    });

  }

  // ==========================
  // DRIVER DOCUMENTS
  // ==========================

  hasLicense(): boolean {
    return this.driverDocs().some(doc => doc.type === 'DRIVER_LICENSE');
  }

  hasIdCard(): boolean {
    return this.driverDocs().some(doc => doc.type === 'ID_CARD');
  }

  hasCompleteDocuments(): boolean {
    return this.hasLicense() && this.hasIdCard();
  }

  previewDriverDocument(id: string): void {

    this.driverDocumentService.previewDriverDocument(id).subscribe({

      next: blob => {

        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 60000);

      },

      error: err => {

        console.error(err);



      }

    });

  }

  // ==========================
  // REQUESTS
  // ==========================

  loadMyRequests(): void {

    this.loadingRequests.set(true);

    this.userRequestService.getMine().subscribe({

      next: requests => {

        this.requests.set(requests);

        this.loadingRequests.set(false);

      },

      error: err => {

        console.error(err);

        this.loadingRequests.set(false);

      }

    });

  }

  openRequestForm(): void {
    this.showRequestForm.set(true);
  }

  closeRequestForm(): void {

    this.showRequestForm.set(false);

    this.requestForm = {
      type: '',
      subject: '',
      description: ''
    };

  }

  submitRequest(): void {

    if (
      !this.requestForm.type ||
      !this.requestForm.subject ||
      !this.requestForm.description
    ) {
      return;
    }

    this.userRequestService.create(this.requestForm).subscribe({

      next: () => {

        this.loadMyRequests();

        this.closeRequestForm();


      },

      error: err => {

        console.error(err);


      }

    });

  }

  isSuperAdmin(): boolean {
    return this.user()?.role === 'SUPER_ADMIN';
  }

}