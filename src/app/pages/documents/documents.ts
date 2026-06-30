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
    this.driverService.getAll().subscribe(data => {
      this.driverDocs.set(data);
      setTimeout(() => feather.replace(), 0);
    });
    this.vehicleService.getAll().subscribe(data => this.vehicleDocs.set(data));
    this.missionService.getAll().subscribe(data => this.missionDocs.set(data));
  }

  selectedFile: File | null = null;

  uploadTitle = '';
  uploadType: 'DRIVER_LICENSE' | 'ID_CARD' = 'DRIVER_LICENSE';
  uploadDriverId = '';

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDriverDocument() {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    this.driverService.upload(
      this.selectedFile,
      this.uploadTitle,
      this.uploadType,
      this.uploadDriverId
    ).subscribe({
      next: () => {
        alert('Upload successful');

        this.loadAll();

        this.uploadTitle = '';
        this.uploadType = 'DRIVER_LICENSE';
        this.uploadDriverId = '';
        this.selectedFile = null;
      },
      error: (err) => {
        console.error(err);
        alert('Upload failed');
      }
    });
  }

  download(id: string) {
    window.open(
      `http://localhost:8080/api/driver-documents/${id}/download`,
      '_blank'
    );
  }

  viewDetails(id: string) {
  this.router.navigate(['/documents/driver', id]);
}
}
