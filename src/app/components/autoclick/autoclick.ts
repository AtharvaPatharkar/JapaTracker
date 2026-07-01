import { Component, Input, Output, EventEmitter, OnDestroy, NgZone, OnChanges, SimpleChanges, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundService } from '../../services/sound';

import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';
import { JapaStateService } from '../../services/japa-state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-autoclick',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './autoclick.html',
  styleUrl: './autoclick.css',
})
export class AutoclickComponent implements OnInit, OnDestroy, OnChanges {
  @Input() incrementFunction!: () => void;
  @Input() mala: number = 0;
  @Output() autoStopped = new EventEmitter<void>();

  private japaSub?: Subscription;


  // Injecting Services
  private zone = inject(NgZone);
  private sound = inject(SoundService);
  private langService = inject(LanguageService);
  public state = inject(JapaStateService);

  intervalId: any = null;
  speed: number = 1000;
  isRunning: boolean = false;

  private typingTimer: any;
  private startMala: number = 0;
  userInputTarget: number | null = null;
  fixedTargetMala: number | null = null;
  remainingMala: number = 0;

  isSaverActive: boolean = false;

  private cdr = inject(ChangeDetectorRef);

  // autoclick.ts मध्ये याप्रमाणे बदल करा

  // autoclick.ts मध्ये हे बदल करा

  // ngOnInit() {
  //   // १. सर्व्हिसकडून अपडेट्स ऐका
  //   this.japaSub = this.state.japaUpdated.subscribe(() => {
  //     if (this.state.isRunning && this.fixedTargetMala !== null) {
  //       this.syncWithService(); // आकडे सिंक करा
  //       this.cdr.detectChanges();
  //     } else if (!this.state.isRunning) {
  //       // 🔥 जर सर्व्हिसमध्ये जप थांबला असेल (उदा. रिस्टार्ट), तर UI क्लियर करा
  //       this.fixedTargetMala = null;
  //       this.remainingMala = 0;
  //       this.isRunning = false;
  //       this.cdr.detectChanges();
  //     }
  //   });

  //   if (this.state.isRunning) {
  //     this.syncWithService();
  //     if (!this.state.intervalId) {
  //       this.state.startAutoclick();
  //     }
  //   }
  // }

  changeSpeed(value: number) {
    const newSpeed = (value > 0) ? value : 1000;
    this.speed = newSpeed;
    this.state.speed = newSpeed;
    if (this.state.isRunning) {
      this.state.startAutoclick();
    }
  }

  private stopFromService() {
    this.state.stopAutoclick();
    this.isRunning = false;
    this.fixedTargetMala = null;
    this.remainingMala = 0;
    this.userInputTarget = null;
    localStorage.removeItem('active_japa_session');
    this.autoStopped.emit();
    this.cdr.detectChanges();
  }

  // private syncWithService(isInitial = false) {
  //   this.isRunning = this.state.isRunning;
  //   this.fixedTargetMala = this.state.autoTargetMala;
  //   this.startMala = this.state.autoStartMala;
  //   this.remainingMala = this.state.autoRemainingMala;
  // }

  private loadSession() {
    const saved = localStorage.getItem('active_japa_session');
    if (saved) {
      const session = JSON.parse(saved);

      if (session.isRunning) {
        this.fixedTargetMala = session.target;
        this.startMala = session.startMala;
        this.remainingMala = session.remaining;
        this.resumeAutoclick();
      }
    }
  }

  private saveCurrentSession() {
    const session = {
      remaining: this.remainingMala,
      target: this.fixedTargetMala,
      startMala: this.startMala,
      isRunning: this.isRunning
    };
    localStorage.setItem('active_japa_session', JSON.stringify(session));
  }

  start() {
    if (this.state.intervalId || !this.userInputTarget) return;

    this.state.autoTargetMala = this.userInputTarget;
    this.state.autoStartMala = this.state.mala;
    this.state.autoRemainingMala = this.userInputTarget;
    this.state.isRunning = true;

    this.syncWithService();
    this.state.startAutoclick();
    this.saveCurrentSession();
    this.cdr.detectChanges();
  }

  private triggerFlashEffect() {
    const circle = document.querySelector('.circle-container');
    if (circle) {
      circle.classList.add('auto-flashing');
      setTimeout(() => circle.classList.remove('auto-flashing'), 150);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.state.isRunning && this.fixedTargetMala !== null) {
      const completedSinceStart = this.state.mala - this.startMala;
      this.remainingMala = Math.max(0, this.fixedTargetMala - completedSinceStart);
      this.state.autoRemainingMala = this.remainingMala;

      if (completedSinceStart >= this.fixedTargetMala) {
        this.state.stopAutoclick();
        this.autoStopped.emit();
      }
    }
  }

  stop() {
    if (this.state.isRunning) {
      const shouldStop = confirm(this.langService.getTranslate('stop_confirm'));
      if (shouldStop) {
        this.stopFromService();
      }
    }
  }

  private forceStop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    this.fixedTargetMala = null;
  }

  handleStartClick() {
    if (this.isRunning && this.userInputTarget !== null) {
      this.processTargetUpdate(this.userInputTarget);
    } else {
      this.start();
    }
  }

  private processTargetUpdate(newVal: number) {
    const completedSinceStart = this.state.mala - this.startMala;
    if (completedSinceStart >= newVal) {
      alert(this.langService.getTranslate('auto_target_reached'));
      this.stopFromService();
    } else {
      this.state.autoTargetMala = newVal;
      this.fixedTargetMala = newVal;
      this.remainingMala = newVal - completedSinceStart;
      this.userInputTarget = null;
      this.saveCurrentSession();
      alert(this.langService.getTranslate('auto_target_updated'));
    }
  }


  setTargetMala(value: number) {
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.userInputTarget = (value > 0) ? value : null;
    }, 500);
  }

  async toggleBatterySaver(active: boolean) {
    this.isSaverActive = active;
    if (active) {
      await this.sound.requestWakeLock();
      document.body.classList.add('battery-saver-active');
    } else {
      this.sound.releaseWakeLock();
      document.body.classList.remove('battery-saver-active');
    }
  }

  ngOnDestroy() {
    if (this.japaSub) {
      this.japaSub.unsubscribe();
    }
  }


  private resumeAutoclick() {
    if (this.state.intervalId) {
      console.log("Autoclick is already running in background...");
      return;
    }

    this.state.startAutoclick();
  }

  // private syncWithService(isInitial = false) {
  //   this.isRunning = this.state.isRunning;
  //   this.fixedTargetMala = this.state.autoTargetMala;
  //   this.startMala = this.state.autoStartMala;

  //   // Remaining Mala कॅल्क्युलेशन
  //   if (this.fixedTargetMala !== null) {
  //     const completedSinceStart = this.state.mala - this.startMala;
  //     this.remainingMala = Math.max(0, this.fixedTargetMala - completedSinceStart);
  //     this.state.autoRemainingMala = this.remainingMala;

  //     // टार्गेट पूर्ण झाले का तपासा
  //     if (completedSinceStart >= this.fixedTargetMala) {
  //       this.stopFromService();
  //     }
  //   }
  // }


  ngOnInit() {
    this.japaSub = this.state.japaUpdated.subscribe(() => {
      this.syncWithService();
      this.cdr.detectChanges();
    });

    if (this.state.isRunning) {
      this.syncWithService();
      if (!this.state.intervalId) {
        this.state.startAutoclick();
      }
    }
  }

  private syncWithService() {
    this.isRunning = this.state.isRunning;
    this.fixedTargetMala = this.state.autoTargetMala;
    this.startMala = this.state.autoStartMala;

    if (this.fixedTargetMala !== null) {
      const completedSinceStart = this.state.mala - this.startMala;
      this.remainingMala = Math.max(0, this.fixedTargetMala - completedSinceStart);
      this.state.autoRemainingMala = this.remainingMala;
    }
  }

  // १. स्पीडसाठी व्हॅलिडेशन
onSpeedInputChange(event: any) {
  const input = event.target;
  // फक्त 0 ते 9 अंक ठेवा, बाकी सर्व रिमूव्ह करा
  const value = input.value.replace(/[^0-9]/g, '');
  input.value = value;
  
  // व्हॅल्यू अपडेट करा
  this.changeSpeed(Number(value) || 1000);
}

// २. टार्गेट माळासाठी व्हॅलिडेशन
onTargetInputChange(event: any) {
  const input = event.target;
  // फक्त 0 ते 9 अंक ठेवा
  const value = input.value.replace(/[^0-9]/g, '');
  input.value = value;
  
  // व्हॅल्यू अपडेट करा
  this.setTargetMala(Number(value) || 0);
}
}