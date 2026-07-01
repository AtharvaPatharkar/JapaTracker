import { inject, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { SoundService } from './sound';

@Injectable({ providedIn: 'root' })
export class JapaStateService {
  private sound = inject(SoundService);
  private zone = inject(NgZone);

  count: number = 0;
  mala: number = 0;
  target: number = 108;
  isLimitReached: boolean = false;
  public japaUpdated = new Subject<void>();

  isRunning: boolean = false;
  autoTargetMala: number | null = null;
  autoRemainingMala: number = 0;
  autoStartMala: number = 0;
  speed: number = 1000;
  intervalId: any = null;

  constructor() {
    this.loadState();
  }

  private getUID(): string {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.uid || 'guest';
      } catch (e) { return 'guest'; }
    }
    return 'guest';
  }

  doIncrement() {
    if (this.isLimitReached) {
      this.count = 1;
      this.isLimitReached = false;
    } else {
      this.count++;
    }

    this.sound.playClick();
    this.sound.vibrate();

    if (this.count >= this.target) {
      this.mala++;
      this.isLimitReached = true;
      this.sound.playMala();

      setTimeout(() => {
        this.zone.run(() => {
          if (this.isLimitReached && this.count >= this.target) {
            this.count = 0;
            this.saveState();
            this.japaUpdated.next();
            console.log("Mala completion display timeout: Count reset to 0");
          }
        });
      }, 10000);
    }

    this.saveState();
    this.japaUpdated.next();
  }

public saveState() {
  const uid = this.getUID();
  const data = {
    count: this.count,
    mala: this.mala,
    target: this.target,
    isLimitReached: this.isLimitReached
  };
  // ✅ नेहमी युजर आयडीनुसार डेटा सेव्ह करा
  localStorage.setItem(`japa_data_${uid}`, JSON.stringify(data));
}

public loadState() {
  const uid = this.getUID();
  const saved = localStorage.getItem(`japa_data_${uid}`);

  if (saved) {
    const data = JSON.parse(saved);
    this.count = data.count || 0;
    this.mala = data.mala || 0;
    this.target = data.target || 108;
    this.isLimitReached = data.isLimitReached || false;
  } else {
    this.resetToDefault(); // डेटा नसेल तर 0 आणि 108 करा
  }
  this.japaUpdated.next();
}

  // public loadState() {
  //   const uid = this.getUID();
  //   const saved = localStorage.getItem('main_japa_count');

  //   if (saved) {
  //     const data = JSON.parse(saved);
  //     this.count = data.count || 0;
  //     this.mala = data.mala || 0;
  //     this.isLimitReached = data.isLimitReached || false;
  //     this.autoTargetMala = data.autoTargetMala || null;
  //     this.autoRemainingMala = data.autoRemainingMala || 0;
  //     this.autoStartMala = data.autoStartMala || 0;
  //     this.isRunning = data.isRunning || false;
  //   } else {
  //     this.count = 0;
  //     this.mala = 0;
  //     this.isLimitReached = false;
  //   }

  //   const userSpecificTarget = localStorage.getItem(`target_user_${uid}`);
  //   this.target = userSpecificTarget ? parseInt(userSpecificTarget) : 108;

  //   this.japaUpdated.next();
  // }

  startAutoclick() {
    this.stopAutoclick();
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.zone.run(() => {
        this.doIncrement();
      });
    }, this.speed);

    this.saveState();
  }

  stopAutoclick() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.saveState();
  }


public resetToDefault() {
  this.count = 0;
  this.mala = 0;
  this.target = 108;
  this.isLimitReached = false;
  this.isRunning = false;
  this.japaUpdated.next();
}
}