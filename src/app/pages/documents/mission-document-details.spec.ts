import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionDocumentDetails } from './mission-document-details';

describe('MissionDocumentDetails', () => {
  let component: MissionDocumentDetails;
  let fixture: ComponentFixture<MissionDocumentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionDocumentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionDocumentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
