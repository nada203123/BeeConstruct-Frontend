import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyCommandeComponent } from './modify-commande.component';

describe('ModifyCommandeComponent', () => {
  let component: ModifyCommandeComponent;
  let fixture: ComponentFixture<ModifyCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyCommandeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
