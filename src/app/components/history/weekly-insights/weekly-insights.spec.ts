import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyInsights } from './weekly-insights';

describe('WeeklyInsights', () => {
  let component: WeeklyInsights;
  let fixture: ComponentFixture<WeeklyInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyInsights],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyInsights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
