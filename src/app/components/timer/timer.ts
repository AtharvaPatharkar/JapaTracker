import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { SoundService } from '../../services/sound';
import { ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './timer.html',
  styleUrls: ['./timer.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TimerComponent {


  timeLeft: number = 0;
  intervalId: any;
  isRunning: boolean = false;

  showPopup: boolean = false;
  animate: boolean = false;

timeInput: number | null = null;
  constructor(
    private sound: SoundService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

startTimer() {
  if (this.isRunning) return;
  if (!this.timeInput || this.timeInput <= 0) return;

  this.timeLeft = this.timeInput * 60;
  this.isRunning = true;

  this.zone.runOutsideAngular(() => {

    this.intervalId = setInterval(() => {

      this.timeLeft--;

      // 🔥 THIS IS THE REAL FIX
      this.zone.run(() => {
        this.cdr.detectChanges();
      });

      // animation
      this.animate = false;
      setTimeout(() => {
        this.animate = true;
      }, 10);

      if (this.timeLeft <= 0) {
        this.timeLeft = 0;

        this.zone.run(() => {
          this.stopTimer();
          this.playAlarm();
        });
      }

    }, 1000);

  });
}
  stopTimer() {
    clearInterval(this.intervalId);
    this.isRunning = false;
  }

  playAlarm() {
    this.showPopup = true;
    this.sound.playBeepFor3Sec();
  }

  closePopup() {
    this.showPopup = false;
    this.sound.stopBeep();
  }

  get displayTime(): string {
    const safeTime = Math.max(0, this.timeLeft);

    const min = Math.floor(safeTime / 60);
    const sec = safeTime % 60;

    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }

onTimerInputChange(event: any) {
  const input = event.target;
  let value = input.value.replace(/[^0-9]/g, '');
  input.value = value;
  this.timeInput = value === '' ? 1 : Number(value);
}
}