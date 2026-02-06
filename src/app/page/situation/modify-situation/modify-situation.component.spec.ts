import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySituationComponent } from './modify-situation.component';

describe('ModifySituationComponent', () => {
  let component: ModifySituationComponent;
  let fixture: ComponentFixture<ModifySituationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifySituationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifySituationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
