import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChantierDetailComponent } from './chantier-detail.component';

describe('ChantierDetailComponent', () => {
  let component: ChantierDetailComponent;
  let fixture: ComponentFixture<ChantierDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChantierDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChantierDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
