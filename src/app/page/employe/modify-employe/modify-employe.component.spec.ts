import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyEmployeComponent } from './modify-employe.component';

describe('ModifyEmployeComponent', () => {
  let component: ModifyEmployeComponent;
  let fixture: ComponentFixture<ModifyEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyEmployeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
