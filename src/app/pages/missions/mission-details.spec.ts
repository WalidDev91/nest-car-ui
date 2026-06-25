import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionDetails } from './mission-details';

describe('MissionDetails', () => {
  let component: MissionDetails;
  let fixture: ComponentFixture<MissionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
