import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyMeter } from './energy-meter';

describe('EnergyMeter', () => {
  let component: EnergyMeter;
  let fixture: ComponentFixture<EnergyMeter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergyMeter],
    }).compileComponents();

    fixture = TestBed.createComponent(EnergyMeter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
