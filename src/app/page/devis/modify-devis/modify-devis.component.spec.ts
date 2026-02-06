import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyDevisComponent } from './modify-devis.component';

describe('ModifyDevisComponent', () => {
  let component: ModifyDevisComponent;
  let fixture: ComponentFixture<ModifyDevisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyDevisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyDevisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
