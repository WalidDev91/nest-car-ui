import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VehicleDetails } from './vehicle-details';

describe('VehicleDetails', () => {
  let component: VehicleDetails;
  let fixture: ComponentFixture<VehicleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleDetails],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VehicleDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});