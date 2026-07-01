import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusMeter } from './focus-meter';

describe('FocusMeter', () => {
  let component: FocusMeter;
  let fixture: ComponentFixture<FocusMeter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocusMeter],
    }).compileComponents();

    fixture = TestBed.createComponent(FocusMeter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
