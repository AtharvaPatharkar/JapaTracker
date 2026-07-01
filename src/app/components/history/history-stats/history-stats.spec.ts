import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryStats } from './history-stats';

describe('HistoryStats', () => {
  let component: HistoryStats;
  let fixture: ComponentFixture<HistoryStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryStats],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
