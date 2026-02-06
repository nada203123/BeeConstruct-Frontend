import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyOffreComponent } from './modify-offre.component';

describe('ModifyOffreComponent', () => {
  let component: ModifyOffreComponent;
  let fixture: ComponentFixture<ModifyOffreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyOffreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyOffreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
