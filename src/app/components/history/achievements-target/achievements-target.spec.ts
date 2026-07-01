import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementsTarget } from './achievements-target';

describe('AchievementsTarget', () => {
  let component: AchievementsTarget;
  let fixture: ComponentFixture<AchievementsTarget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsTarget],
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementsTarget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
