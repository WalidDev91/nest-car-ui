import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MissionService } from './mission.service';
import { Mission } from '../models/mission';
import { environment } from '../../environments/environment';

describe('MissionService', () => {
  let service: MissionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(MissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all missions', () => {
    const missions: Mission[] = [];

    service.getAll().subscribe(result => {
      expect(result).toEqual(missions);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/missions`);

    expect(req.request.method).toBe('GET');

    req.flush(missions);
  });

  it('should get a mission by id', () => {
    const mission = { id: '123' };

    service.getById('123').subscribe(result => {
      expect(result).toEqual(mission);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123`
    );

    expect(req.request.method).toBe('GET');

    req.flush(mission);
  });

  it('should get missions by vehicle id', () => {
    const missions: Mission[] = [];

    service.getByVehicleId('vehicle-123').subscribe(result => {
      expect(result).toEqual(missions);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/vehicle/vehicle-123`
    );

    expect(req.request.method).toBe('GET');

    req.flush(missions);
  });

  it('should create a mission', () => {
    const request = {
      vehicleId: 'vehicle-123',
      destination: 'Tunis',
    };

    service.create(request).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/missions`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush({});
  });

  it('should update a mission', () => {
    const request = {
      destination: 'Sousse',
    };

    service.update('123', request).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123`
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);

    req.flush({});
  });

  it('should delete a mission', () => {
    service.delete('123').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123`
    );

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('should update document verification status', () => {
    service.updateDocumentsVerification('123', true).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123/verification?verified=true`
    );

    expect(req.request.method).toBe('PATCH');

    req.flush({});
  });

  it('should save vehicle inspection', () => {
    const request = {
      brakesOk: true,
      lightsOk: true,
    };

    service.saveVehicleInspection('123', request).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123/inspection`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush({});
  });

  it('should upload an inspection photo', () => {
    const file = new File(['photo'], 'inspection.jpg', {
      type: 'image/jpeg',
    });

    service.uploadInspectionPhoto(
      '123',
      file,
      'Front of vehicle'
    ).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123/inspection/photos`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);

    const formData = req.request.body as FormData;

    expect(formData.get('file')).toEqual(file);
    expect(formData.get('description')).toBe('Front of vehicle');

    req.flush({});
  });

  it('should delete an inspection photo', () => {
    service.deleteInspectionPhoto('123', '456').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123/inspection/photos/456`
    );

    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  it('should assign a mission', () => {
    const request = {
      driverId: 'driver-123',
    };

    service.assignMission('123', request).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/missions/123/assignment`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(request);

    req.flush({});
  });

  it('should return an absolute photo URL unchanged', () => {
    const url = 'https://example.com/photo.jpg';

    expect(service.getPhotoUrl(url)).toBe(url);
  });

  it('should build the server URL for a relative photo path', () => {
    expect(service.getPhotoUrl('/uploads/photo.jpg'))
      .toBe(`${environment.apiUrl.replace('/api', '')}/uploads/photo.jpg`);
  });

  it('should return an empty string for an empty photo URL', () => {
    expect(service.getPhotoUrl('')).toBe('');
  });
});