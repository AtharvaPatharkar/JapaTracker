import { TestBed } from '@angular/core/testing';

import { CounterStateService } from './counter-state';

describe('CounterState', () => {
  let service: CounterStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
