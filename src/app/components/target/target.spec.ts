import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetComponent } from './target';

describe('Target', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
