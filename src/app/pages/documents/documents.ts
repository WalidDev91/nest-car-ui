import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';

import { DriverDocumentService } from '../../services/driver-document.service';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionDocumentService } from '../../services/mission-document.service';

import { DriverDocument } from '../../models/driver-document';
import { VehicleDocument } from '../../models/vehicle-document';
import { MissionDocument } from '../../models/mission-document';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {

  selectedTab = signal<'driver' | 'vehicle' | 'mission'>('driver');

  driverDocs = signal<DriverDocument[]>([]);
  vehicleDocs = signal<VehicleDocument[]>([]);
  missionDocs = signal<MissionDocument[]>([]);


  isDriver = localStorage.getItem('role') === 'DRIVER';

  currentUserId = localStorage.getItem('userId') ?? '';

  // DRIVER
  selectedFile: File | null = null;
  uploadTitle = '';
  uploadType: 'DRIVER_LICENSE' | 'ID_CARD' = 'DRIVER_LICENSE';

  // VEHICLE
  selectedVehicleFile: File | null = null;
  uploadVehicleTitle = '';
  uploadVehicleType: 'LICENSE' | 'TECHNICAL_CHECK' | 'INSURANCE' = 'LICENSE';
  uploadVehicleYear = new Date().getFullYear();
  uploadVehicleId = '';

  // MISSION
  selectedMissionFile: File | null = null;
  uploadMissionTitle = '';
  uploadMissionId = '';

  constructor(
    private driverService: DriverDocumentService,
    private vehicleService: VehicleDocumentService,
    private missionService: MissionDocumentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAll();
  }

  selectTab(tab: 'driver' | 'vehicle' | 'mission') {
    this.selectedTab.set(tab);
    setTimeout(() => feather.replace(), 0);
  }

  loadAll() {

    // backend now returns:
    // admin -> all
    // driver -> only his documents
    this.driverService.getAll().subscribe(data => {
      this.driverDocs.set(data);
      setTimeout(() => feather.replace(), 0);
    });

    // leave unchanged for now
    this.vehicleService.getAll().subscribe(data => {
      this.vehicleDocs.set(data);
      setTimeout(() => feather.replace(), 0);
    });

    this.missionService.getAll().subscribe(data => {
      this.missionDocs.set(data);
      setTimeout(() => feather.replace(), 0);
    });
  }

  // ================= DRIVER =================

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDriverDocument() {

    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    const driverId = this.currentUserId;

    this.driverService.upload(
      this.selectedFile,
      this.uploadTitle,
      this.uploadType,
      driverId
    ).subscribe({
      next: () => {

        alert('Upload successful');

        this.loadAll();

        this.selectedFile = null;
        this.uploadTitle = '';
        this.uploadType = 'DRIVER_LICENSE';

      },
      error: err => {
        console.error(err);
        alert('Upload failed');
      }
    });

  }


  downloadDriver(id: string) {
    window.open(
      `http://localhost:8080/api/driver-documents/${id}/download`,
      '_blank'
    );
  }

  viewDriverDetails(id: string) {
    this.router.navigate(['/documents/driver', id]);
  }

  // ================= VEHICLE =================

  onVehicleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedVehicleFile = input.files[0];
    }
  }

  uploadVehicleDocument() {

    if (!this.selectedVehicleFile) {
      alert('Please select a file');
      return;
    }

    this.vehicleService.upload(
      this.selectedVehicleFile,
      this.uploadVehicleTitle,
      this.uploadVehicleType,
      this.uploadVehicleYear,
      this.uploadVehicleId
    ).subscribe({
      next: () => {

        alert('Upload successful');

        this.loadAll();

        this.uploadVehicleTitle = '';
        this.uploadVehicleType = 'LICENSE';
        this.uploadVehicleYear = new Date().getFullYear();
        this.uploadVehicleId = '';
        this.selectedVehicleFile = null;

      }
    });

  }

  downloadVehicle(id: string) {
    window.open(
      `http://localhost:8080/api/vehicle-documents/${id}/download`,
      '_blank'
    );
  }

  viewVehicleDetails(id: string) {
    this.router.navigate(['/documents/vehicle', id]);
  }

  // ================= MISSION =================

  onMissionFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedMissionFile = input.files[0];
    }
  }

  uploadMissionDocument() {

    if (!this.selectedMissionFile) {
      alert('Please select a file');
      return;
    }

    this.missionService.upload(
      this.selectedMissionFile,
      this.uploadMissionTitle,
      this.uploadMissionId
    ).subscribe({
      next: () => {

        alert('Upload successful');

        this.loadAll();

        this.uploadMissionTitle = '';
        this.uploadMissionId = '';
        this.selectedMissionFile = null;

      }
    });

  }

  downloadMission(id: string) {
    window.open(
      `http://localhost:8080/api/mission-documents/${id}/download`,
      '_blank'
    );
  }

  viewMissionDetails(id: string) {
    this.router.navigate(['/documents/mission', id]);
  }

}