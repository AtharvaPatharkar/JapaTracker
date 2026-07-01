import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmComponent } from './alarm';

describe('Alarm', () => {
  let component: AlarmComponent;
  let fixture: ComponentFixture<AlarmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
