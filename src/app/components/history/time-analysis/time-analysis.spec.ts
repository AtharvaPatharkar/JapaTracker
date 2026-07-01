import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAnalysis } from './time-analysis';

describe('TimeAnalysis', () => {
  let component: TimeAnalysis;
  let fixture: ComponentFixture<TimeAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
