import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentLogs } from './recent-logs';

describe('RecentLogs', () => {
  let component: RecentLogs;
  let fixture: ComponentFixture<RecentLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentLogs],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
