import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituationDetailsComponent } from './situation-details.component';

describe('SituationDetailsComponent', () => {
  let component: SituationDetailsComponent;
  let fixture: ComponentFixture<SituationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SituationDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SituationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
