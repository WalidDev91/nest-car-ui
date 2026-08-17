/* import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { Documents } from './documents';

import { DriverDocumentService } from '../../services/driver-document.service';
import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { MissionDocumentService } from '../../services/mission-document.service';
import { VehicleService } from '../../services/vehicle.service';
import { MissionService } from '../../services/mission.service';
import { ToastService } from '../../services/toast.service';

describe('Documents', () => {

  let component: Documents;
  let fixture: ComponentFixture<Documents>;

  let driverDocumentService: any;
  let vehicleDocumentService: any;
  let missionDocumentService: any;
  let vehicleService: any;
  let missionService: any;
  let toastService: any;

  beforeEach(async () => {

    driverDocumentService = {
      getAll: () => of([]),
      upload: () => of({}),
      update: () => of({}),
      deleteDriverDocument: () => of({}),
      updateDriverDocumentStatus: () => of({}),
      download: () => of({}),
      previewDriverDocument: () => of(new Blob())
    };

    vehicleDocumentService = {
      getAll: () => of([]),
      upload: () => of({}),
      update: () => of({}),
      delete: () => of({}),
      download: () => of({}),
      previewVehicleDocument: () => of(new Blob())
    };

    missionDocumentService = {
      getAll: () => of([]),
      upload: () => of({}),
      update: () => of({}),
      deleteDocument: () => of({}),
      download: () => of({}),
      previewMissionDocument: () => of(new Blob())
    };

    vehicleService = {
      getAll: () => of([])
    };

    missionService = {
      getAll: () => of([])
    };

    toastService = {
      success: () => { },
      error: () => { }
    };

    await TestBed.configureTestingModule({
      imports: [Documents],
      providers: [
        {
          provide: DriverDocumentService,
          useValue: driverDocumentService
        },
        {
          provide: VehicleDocumentService,
          useValue: vehicleDocumentService
        },
        {
          provide: MissionDocumentService,
          useValue: missionDocumentService
        },
        {
          provide: VehicleService,
          useValue: vehicleService
        },
        {
          provide: MissionService,
          useValue: missionService
        },
        {
          provide: ToastService,
          useValue: toastService
        },
        {
          provide: Router,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Documents);
    component = fixture.componentInstance;
  });

  // ============================================================
  // 1. COMPONENT
  // ============================================================

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ============================================================
  // 2. INITIAL LOAD
  // ============================================================

  it('should load documents on initialization', () => {

    fixture.detectChanges();

    expect(component.driverDocs()).toEqual([]);
    expect(component.vehicleDocs()).toEqual([]);
    expect(component.missionDocs()).toEqual([]);
    expect(component.vehicles()).toEqual([]);
    expect(component.missions()).toEqual([]);
    expect(component.loading()).toBe(false);
  });

  // ============================================================
  // 3. TABS
  // ============================================================

  it('should change the selected tab', () => {

    component.selectTab('vehicle');

    expect(component.selectedTab()).toBe('vehicle');
    expect(component.currentPage()).toBe(1);
  });

  // ============================================================
  // 4. SEARCH
  // ============================================================

  it('should filter documents by search text', () => {

    component.driverDocs.set([
      {
        id: '1',
        title: 'Driving License'
      },
      {
        id: '2',
        title: 'Insurance'
      }
    ] as any);

    component.onSearch('license');

    expect(component.filteredDocuments().length).toBe(1);
    expect(component.filteredDocuments()[0].title)
      .toBe('Driving License');
  });

  // ============================================================
  // 5. DRIVER STATUS FILTER
  // ============================================================

  it('should filter driver documents by status', () => {

    component.driverDocs.set([
      {
        id: '1',
        title: 'License',
        status: 'APPROVED'
      },
      {
        id: '2',
        title: 'Medical',
        status: 'PENDING'
      }
    ] as any);

    component.filterDriverStatus('APPROVED');

    expect(component.filteredDocuments().length).toBe(1);
    expect(component.filteredDocuments()[0].status)
      .toBe('APPROVED');
  });

  // ============================================================
  // 6. VEHICLE TYPE FILTER
  // ============================================================

  it('should filter vehicle documents by type', () => {

    component.selectTab('vehicle');

    component.vehicleDocs.set([
      {
        id: '1',
        title: 'Insurance',
        type: 'INSURANCE'
      },
      {
        id: '2',
        title: 'License',
        type: 'LICENSE'
      }
    ] as any);

    component.filterVehicleType('INSURANCE');

    expect(component.filteredDocuments().length).toBe(1);
    expect(component.filteredDocuments()[0].type)
      .toBe('INSURANCE');
  });

  // ============================================================
  // 7. PAGINATION
  // ============================================================

  it('should move to the next page when documents exceed page size', () => {

    component.driverDocs.set(
      Array.from({ length: 15 }, (_, index) => ({
        id: `${index}`,
        title: `Document ${index}`
      })) as any
    );

    component.nextPage();

    expect(component.currentPage()).toBe(2);
  });

  it('should not move past the last page', () => {

    component.driverDocs.set([
      {
        id: '1',
        title: 'Document'
      }
    ] as any);

    component.nextPage();

    expect(component.currentPage()).toBe(1);
  });

  // ============================================================
  // 8. FILE VALIDATION
  // ============================================================

  it('should accept a valid PDF file', () => {

    const file = new File(
      ['test'],
      'document.pdf',
      {
        type: 'application/pdf'
      }
    );

    expect(component.validateFile(file)).toBe(true);
  });

  it('should reject an invalid file type', () => {

    const file = new File(
      ['test'],
      'document.txt',
      {
        type: 'text/plain'
      }
    );

    expect(component.validateFile(file)).toBe(false);

    expect(toastService.error)
      .toHaveBeenCalledWith(
        'Only PDF and image files are allowed'
      );
  });

  // ============================================================
  // 9. DRIVER UPLOAD VALIDATION
  // ============================================================

  it('should not upload a driver document when required data is missing', () => {

    component.uploadDriverTitle = '';
    component.uploadDriverType = '';
    component.selectedDriverFile = null;

    component.uploadDriverDocument();

    expect(driverDocumentService.upload)
      .not.toHaveBeenCalled();
  });

  // ============================================================
  // 10. VEHICLE UPLOAD VALIDATION
  // ============================================================

  it('should not upload a vehicle document when required data is missing', () => {

    component.uploadVehicleTitle = '';
    component.uploadVehicleType = '';
    component.uploadVehicleId = '';
    component.selectedVehicleFile = null;

    component.uploadVehicleDocument();

    expect(vehicleDocumentService.upload)
      .not.toHaveBeenCalled();
  });

  // ============================================================
  // 11. MISSION UPLOAD VALIDATION
  // ============================================================

  it('should not upload a mission document when required data is missing', () => {

    component.uploadMissionTitle = '';
    component.uploadMissionId = '';
    component.selectedMissionFile = null;

    component.uploadMissionDocument();

    expect(missionDocumentService.upload)
      .not.toHaveBeenCalled();
  });

  // ============================================================
  // 12. DRIVER DELETE
  // ============================================================

  // it('should delete a driver document', () => {

  //   component.driverDocumentToDeleteId = 'driver-1';

  //   component.confirmDeleteDriverDocument();

  //   expect(
  //     driverDocumentService.deleteDriverDocument
  //   ).toHaveBeenCalledWith('driver-1');
  // });

  // ============================================================
  // 13. DRIVER VALIDATION
  // ============================================================

  it('should approve a driver document', () => {

    component.approveDriverDocument('driver-1');

    expect(
      driverDocumentService.updateDriverDocumentStatus
    ).toHaveBeenCalledWith(
      'driver-1',
      'APPROVED'
    );
  });

  it('should reject a driver document', () => {

    component.rejectDriverDocument('driver-1');

    expect(
      driverDocumentService.updateDriverDocumentStatus
    ).toHaveBeenCalledWith(
      'driver-1',
      'REJECTED'
    );
  });

}); */