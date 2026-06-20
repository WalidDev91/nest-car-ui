import { TestBed } from '@angular/core/testing';

import { VehicleDocumentService } from './vehicle-document.service';

describe('VehicleDocument', () => {
  let service: VehicleDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
