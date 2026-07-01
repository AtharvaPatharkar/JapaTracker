import { TestBed } from '@angular/core/testing';

import { JapaService } from './japa';

describe('Japa', () => {
  let service: JapaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JapaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
