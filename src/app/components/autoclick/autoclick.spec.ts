import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoclickComponent } from './autoclick';

describe('Autoclick', () => {
  let component: AutoclickComponent;
  let fixture: ComponentFixture<AutoclickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoclickComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoclickComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
