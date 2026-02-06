import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChantiersComponent } from './chantiers.component';

describe('ChantiersComponent', () => {
  let component: ChantiersComponent;
  let fixture: ComponentFixture<ChantiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChantiersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChantiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
