import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { User } from '../../models/user';
import { DriverDocument } from '../../models/driver-document';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  @ViewChild('profilePictureInput')
  profilePictureInput!: ElementRef<HTMLInputElement>;

  // ==========================
  // PAGE STATE
  // ==========================

  loading = signal(false);
  error = signal<string | null>(null);

  selectedTab = signal<
    'info' | 'security' | 'documents' | 'requests'
  >('info');

  // ==========================
  // CURRENT USER
  // ==========================

  user = signal<User | null>(null);

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

  requests = signal<any[]>([]);

  showRequestForm = signal(false);

  requestForm = {
    type: '',
    subject: '',
    description: ''
  };

  // ==========================
  // UPLOADS
  // ==========================

  uploadsUrl = '';

  // ==========================
  // INITIALIZATION
  // ==========================

  constructor() {
    // Temporary data until we connect
    // the component to the authenticated user.
    const temporaryUser: User = {
      id: '',
      firstName: 'Walid',
      lastName: 'Boulima',
      email: 'user@example.com',
      phone: '',
      role: 'ADMIN',
      isValidate: true,
      adminId: '',
      adminName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: null
    };

    this.user.set(temporaryUser);

    this.resetProfileForm();
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

    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.user.set({
      ...currentUser,
      imageUrl: URL.createObjectURL(file),
      updatedAt: new Date().toISOString()
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
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.user.set({
      ...currentUser,
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      email: this.editForm.email,
      phone: this.editForm.phone,
      updatedAt: new Date().toISOString()
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

    if (
      this.passwordForm.newPassword !==
      this.passwordForm.confirmPassword
    ) {
      this.error.set('New passwords do not match.');
      return;
    }

    // Temporary implementation.
    // Connect to the backend change-password endpoint later.

    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.error.set(null);
  }

  // ==========================
  // DRIVER DOCUMENTS
  // ==========================

  hasLicense(): boolean {
    return this.driverDocs().some(
      doc => doc.type === 'DRIVER_LICENSE'
    );
  }

  hasIdCard(): boolean {
    return this.driverDocs().some(
      doc => doc.type === 'ID_CARD'
    );
  }

  hasCompleteDocuments(): boolean {
    return this.hasLicense() && this.hasIdCard();
  }

  previewDriverDocument(id: string): void {
  
  }

  // ==========================
  // REQUESTS
  // ==========================

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

    // Temporary implementation.
    // Later replace with UserRequest model/service.

    this.requests.update(requests => [
      {
        id: crypto.randomUUID(),
        type: this.requestForm.type,
        subject: this.requestForm.subject,
        description: this.requestForm.description,
        status: 'PENDING',
        adminResponse: null,
        createdAt: new Date().toISOString()
      },
      ...requests
    ]);

    this.closeRequestForm();
  }
}