import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CounterStateService {

  count$ = new BehaviorSubject<number>(0);
  target$ = new BehaviorSubject<number>(108);

  increment() {
    const current = this.count$.value;
    const target = this.target$.value;

    let newCount = current + 1;

    if (newCount >= target) {
      newCount = 0;
    }

    this.count$.next(newCount);
  }

  setTarget(val: number) {
    this.target$.next(val);
    this.count$.next(0);
  }

  reset() {
    this.count$.next(0);
  }
}