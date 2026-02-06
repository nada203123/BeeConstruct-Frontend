import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSituationComponent } from './add-situation.component';

describe('AddSituationComponent', () => {
  let component: AddSituationComponent;
  let fixture: ComponentFixture<AddSituationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSituationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSituationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
