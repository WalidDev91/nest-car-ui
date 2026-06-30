import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverDocumentDetails } from './driver-document-details';

describe('DriverDocumentDetails', () => {
  let component: DriverDocumentDetails;
  let fixture: ComponentFixture<DriverDocumentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverDocumentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverDocumentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
