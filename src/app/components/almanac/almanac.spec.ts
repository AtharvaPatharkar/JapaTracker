import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmanacComponent  } from './almanac';

describe('Almanac', () => {
  let component: AlmanacComponent ;
  let fixture: ComponentFixture<AlmanacComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlmanacComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlmanacComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
