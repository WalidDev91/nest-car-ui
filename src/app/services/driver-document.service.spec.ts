import { TestBed } from '@angular/core/testing';

import { DriverDocumentService } from './driver-document.service';

describe('DriverDocument', () => {
  let service: DriverDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
