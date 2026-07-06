import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleDocumentDetails } from './vehicle-document-details';

describe('VehicleDocumentDetails', () => {
  let component: VehicleDocumentDetails;
  let fixture: ComponentFixture<VehicleDocumentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleDocumentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleDocumentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
