import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyClientComponent } from './modify-client.component';

describe('ModifyClientComponent', () => {
  let component: ModifyClientComponent;
  let fixture: ComponentFixture<ModifyClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyClientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
