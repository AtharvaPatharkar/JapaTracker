import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JapaService {

  private countSubject = new BehaviorSubject<number>(0);
  private targetSubject = new BehaviorSubject<number>(108);

  count$ = this.countSubject.asObservable();
  target$ = this.targetSubject.asObservable();

  updateCount(value: number) {
    this.countSubject.next(value);
  }

  updateTarget(value: number) {
    this.targetSubject.next(value);
  }
}