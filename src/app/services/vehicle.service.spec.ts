import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VehicleService } from './vehicle.service';
import { Vehicle } from '../models/vehicle';
import { environment } from '../../environments/environment';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all vehicles', () => {
    const vehicles: Vehicle[] = [];

    service.getAll().subscribe(result => {
      expect(result).toEqual(vehicles);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles`);

    expect(req.request.method).toBe('GET');

    req.flush(vehicles);
  });

  it('should get a vehicle by id', () => {
    const vehicle = { id: '123', registrationNumber: '123-TUN-456' };

    service.getById('123').subscribe(result => {
      expect(result).toEqual(vehicle);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/vehicles/123`
    );

    expect(req.request.method).toBe('GET');

    req.flush(vehicle);
  });

  it('should create a vehicle', () => {
    const vehicle = {
      registrationNumber: '123-TUN-456',
      brand: 'Toyota',
      model: 'Corolla',
    };

    service.create(vehicle).subscribe(result => {
      expect(result).toEqual(vehicle);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/vehicles`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(vehicle);

    req.flush(vehicle);
  });

  it('should update a vehicle', () => {
    const vehicle = {
      registrationNumber: '123-TUN-456',
      brand: 'Toyota',
      model: 'Corolla',
    };

    service.update('123', vehicle).subscribe(result => {
      expect(result).toEqual(vehicle);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/vehicles/123`
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(vehicle);

    req.flush(vehicle);
  });

  it('should delete a vehicle', () => {
    service.delete('123').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/vehicles/123`
    );

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('should upload a vehicle photo', () => {
    const file = new File(['test image'], 'vehicle.jpg', {
      type: 'image/jpeg',
    });

    service.uploadPhoto('123', file).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/vehicles/123/photos`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);

    const formData = req.request.body as FormData;

    expect(formData.get('file')).toEqual(file);

    req.flush({});
  });

  it('should delete a vehicle photo', () => {
    service.deletePhoto('123', '456').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/vehicles/123/photos/456`
    );

    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });
});