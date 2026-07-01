import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusGraph } from './focus-graph';

describe('FocusGraph', () => {
  let component: FocusGraph;
  let fixture: ComponentFixture<FocusGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocusGraph],
    }).compileComponents();

    fixture = TestBed.createComponent(FocusGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
