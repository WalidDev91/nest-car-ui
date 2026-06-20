import { TestBed } from '@angular/core/testing';

import { MissionDocumentService } from './mission-document.service';

describe('MissionDocument', () => {
  let service: MissionDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
