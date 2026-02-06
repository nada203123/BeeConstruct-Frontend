import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousTraitantComponent } from './sous-traitant.component';

describe('SousTraitantComponent', () => {
  let component: SousTraitantComponent;
  let fixture: ComponentFixture<SousTraitantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousTraitantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SousTraitantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
