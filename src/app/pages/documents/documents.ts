import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import feather from 'feather-icons';
import { forkJoin } from 'rxjs';


import { DriverDocumentService } from '../../services/driver-document.service';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionDocumentService } from '../../services/mission-document.service';

import { VehicleService } from '../../services/vehicle.service';
import { MissionService } from '../../services/mission.service';


import { DriverDocument } from '../../models/driver-document';
import { VehicleDocument } from '../../models/vehicle-document';
import { MissionDocument } from '../../models/mission-document';



@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class Documents implements OnInit {


  // ==========================
  // TABS
  // ==========================

  selectedTab = signal<
    'driver' | 'vehicle' | 'mission'
  >('driver');



  // ==========================
  // DATA
  // ==========================


  driverDocs = signal<DriverDocument[]>([]);
  vehicleDocs = signal<VehicleDocument[]>([]);
  missionDocs = signal<MissionDocument[]>([]);


  vehicles = signal<any[]>([]);
  missions = signal<any[]>([]);



  loading = signal(false);



  // ==========================
  // SEARCH
  // ==========================


  search = signal('');



  // ==========================
  // PAGINATION
  // ==========================


  currentPage = signal(1);

  pageSize = 10;



  // ==========================
  // FILTERED DATA
  // ==========================


  filteredDocuments = computed(() => {


    let docs: any[] = [];


    if (this.selectedTab() === 'driver') {
      docs = this.driverDocs();
    }


    if (this.selectedTab() === 'vehicle') {
      docs = this.vehicleDocs();
    }


    if (this.selectedTab() === 'mission') {
      docs = this.missionDocs();
    }



    const value = this.search()
      .toLowerCase();



    if (!value) {
      return docs;
    }



    return docs.filter(doc => {


      return (

        doc.title?.toLowerCase()
          .includes(value)

        ||

        JSON.stringify(doc)
          .toLowerCase()
          .includes(value)

      );


    });



  });



  paginatedDocuments = computed(() => {


    const start =
      (this.currentPage() - 1)
      *
      this.pageSize;


    return this.filteredDocuments()
      .slice(
        start,
        start + this.pageSize
      );


  });



  totalPages = computed(() => {


    return Math.ceil(
      this.filteredDocuments().length
      /
      this.pageSize
    );


  });



  // ==========================
  // STATISTICS
  // ==========================


  totalDocuments = computed(() => {


    return (

      this.driverDocs().length

      +

      this.vehicleDocs().length

      +

      this.missionDocs().length

    );


  });



  driverCount = computed(() =>
    this.driverDocs().length
  );


  vehicleCount = computed(() =>
    this.vehicleDocs().length
  );


  missionCount = computed(() =>
    this.missionDocs().length
  );



  // ==========================
  // ROLE
  // ==========================


  isDriver =
    localStorage.getItem('role')
    ===
    'DRIVER';


  currentUserId =
    localStorage.getItem('userId')
    ?? '';




  // ==========================
  // UPLOAD DRIVER
  // ==========================


  selectedDriverFile: File | null = null;

  uploadDriverTitle = '';

  uploadDriverType:
    'DRIVER_LICENSE'
    |
    'ID_CARD'
    =
    'DRIVER_LICENSE';




  // ==========================
  // UPLOAD VEHICLE
  // ==========================


  selectedVehicleFile: File | null = null;


  uploadVehicleTitle = '';


  uploadVehicleType:
    'LICENSE'
    |
    'TECHNICAL_CHECK'
    |
    'INSURANCE'
    =
    'LICENSE';



  uploadVehicleYear =
    new Date().getFullYear();



  uploadVehicleId = '';




  // ==========================
  // UPLOAD MISSION
  // ==========================


  selectedMissionFile: File | null = null;


  uploadMissionTitle = '';


  uploadMissionId = '';





  constructor(

    private driverDocumentService:
      DriverDocumentService,


    private vehicleDocumentService:
      VehicleDocumentService,


    private missionDocumentService:
      MissionDocumentService,


    private vehicleService:
      VehicleService,


    private missionService:
      MissionService,


    private router: Router

  ) { }




  ngOnInit(): void {
  this.loadDocuments();
}


// ==========================
// LOAD EVERYTHING
// ==========================

loadDocuments(): void {

  this.loading.set(true);

  forkJoin({

    driverDocs: this.driverDocumentService.getAll(),

    vehicleDocs: this.vehicleDocumentService.getAll(),

    missionDocs: this.missionDocumentService.getAll(),

    vehicles: this.vehicleService.getAll(),

    missions: this.missionService.getAll()

  }).subscribe({

    next: (result) => {

      this.driverDocs.set(result.driverDocs);

      this.vehicleDocs.set(result.vehicleDocs);

      this.missionDocs.set(result.missionDocs);

      this.vehicles.set(result.vehicles);

      this.missions.set(result.missions);

      this.loading.set(false);

      setTimeout(() => {
        feather.replace();
      }, 0);

    },

    error: (err) => {

      console.error('Error loading documents:', err);

      this.loading.set(false);

    }

  });

}





  selectTab(
    tab: 'driver' | 'vehicle' | 'mission'
  ) {


    this.selectedTab.set(tab);

    this.currentPage.set(1);


    setTimeout(() => {

      feather.replace();

    }, 0);


  }





  onSearch(value: string) {


    this.search.set(value);

    this.currentPage.set(1);


  }





  nextPage() {

    if (
      this.currentPage()
      <
      this.totalPages()
    ) {

      this.currentPage.update(
        p => p + 1
      );

    }

  }




  previousPage() {

    if (this.currentPage() > 1) {

      this.currentPage.update(
        p => p - 1
      );

    }

  }







  // FILE VALIDATION

  validateFile(file: File) {


    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg'
    ];


    if (!allowed.includes(file.type)) {

      alert(
        'Only PDF and images allowed'
      );

      return false;

    }


    if (file.size > 10_000_000) {

      alert(
        'Maximum file size is 10MB'
      );

      return false;

    }


    return true;

  }





  // ==========================
  // NAVIGATION
  // ==========================



  viewDriverDetails(id: string) {

    this.router.navigate([
      '/documents/driver',
      id
    ]);

  }



  viewVehicleDetails(id: string) {

    this.router.navigate([
      '/documents/vehicle',
      id
    ]);

  }



  viewMissionDetails(id: string) {

    this.router.navigate([
      '/documents/mission',
      id
    ]);

  }

  onMissionFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedMissionFile = input.files[0];
    }

  }


  onDriverFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedDriverFile = input.files[0];
    }

  }



  onVehicleFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedVehicleFile = input.files[0];
    }

  }

  downloadFile(response: any, defaultName: string) {

    const blob = response.body;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = defaultName;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

  }

  downloadMission(id: string) {


    this.missionDocumentService.download(id)
      .subscribe({

        next: response => {

          this.downloadFile(
            response,
            'mission-document'
          );

        },


        error: err => {

          console.error(err);

          alert('Download failed');

        }

      });


  }

  downloadVehicle(id: string) {


    this.vehicleDocumentService.download(id)
      .subscribe({

        next: response => {

          this.downloadFile(
            response,
            'vehicle-document'
          );

        },


        error: err => {

          console.error(err);

          alert('Download failed');

        }

      });


  }

  downloadDriver(id: string) {


    this.driverDocumentService.download(id)
      .subscribe({

        next: response => {

          this.downloadFile(
            response,
            'driver-document'
          );

        },


        error: err => {

          console.error(err);

          alert('Download failed');

        }

      });


  }

  uploadMissionDocument() {


    if (!this.selectedMissionFile) {

      alert('Please select a file');
      return;

    }



    if (!this.validateFile(this.selectedMissionFile)) {
      return;
    }



    this.missionDocumentService.upload(

      this.selectedMissionFile,

      this.uploadMissionTitle,

      this.uploadMissionId

    )
      .subscribe({

        next: () => {


          alert('Mission document uploaded');


          this.loadDocuments();


          this.selectedMissionFile = null;
          this.uploadMissionTitle = '';
          this.uploadMissionId = '';

        },


        error: err => {

          console.error(err);

          alert('Mission upload failed');

        }


      });


  }

  uploadVehicleDocument() {


    if (!this.selectedVehicleFile) {

      alert('Please select a file');
      return;

    }



    if (!this.validateFile(this.selectedVehicleFile)) {
      return;
    }



    this.vehicleDocumentService.upload(

      this.selectedVehicleFile,

      this.uploadVehicleTitle,

      this.uploadVehicleType,

      this.uploadVehicleYear,

      this.uploadVehicleId

    )
      .subscribe({

        next: () => {


          alert('Vehicle document uploaded');


          this.loadDocuments();


          this.selectedVehicleFile = null;
          this.uploadVehicleTitle = '';
          this.uploadVehicleId = '';
          this.uploadVehicleYear = new Date().getFullYear();


        },


        error: err => {

          console.error(err);

          alert('Vehicle upload failed');

        }


      });


  }

  uploadDriverDocument() {

    if (!this.selectedDriverFile) {

      alert('Please select a file');
      return;

    }


    if (!this.validateFile(this.selectedDriverFile)) {
      return;
    }


    this.driverDocumentService.upload(
      this.selectedDriverFile,
      this.uploadDriverTitle,
      this.uploadDriverType,
      this.currentUserId
    )
      .subscribe({

        next: () => {

          alert('Driver document uploaded');

          this.loadDocuments();

          this.selectedDriverFile = null;
          this.uploadDriverTitle = '';
          this.uploadDriverType = 'DRIVER_LICENSE';

        },


        error: err => {

          console.error(err);

          alert('Driver document upload failed');

        }

      });


  }

}