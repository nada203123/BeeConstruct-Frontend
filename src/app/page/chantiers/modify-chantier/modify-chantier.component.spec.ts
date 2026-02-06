import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyChantierComponent } from './modify-chantier.component';

describe('ModifyChantierComponent', () => {
  let component: ModifyChantierComponent;
  let fixture: ComponentFixture<ModifyChantierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyChantierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyChantierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
