import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressCircle } from './progress-circle';

describe('ProgressCircle', () => {
  let component: ProgressCircle;
  let fixture: ComponentFixture<ProgressCircle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressCircle],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressCircle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
