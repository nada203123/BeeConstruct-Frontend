import { TestBed } from '@angular/core/testing';

import { MarchandiseService } from './marchandise.service';

describe('MarchandiseService', () => {
  let service: MarchandiseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarchandiseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
