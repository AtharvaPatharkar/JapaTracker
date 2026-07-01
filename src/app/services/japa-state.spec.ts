import { TestBed } from '@angular/core/testing';

import { JapaStateService } from './japa-state';

describe('JapaState', () => {
  let service: JapaStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JapaStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
