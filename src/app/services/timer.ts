import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  getClock(): Observable<number> {
    return interval(1000); // 🔥 every 1 sec
  }
}