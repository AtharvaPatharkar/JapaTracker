import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoundService } from '../../services/sound';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-alarm',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './alarm.html',
  styleUrls: ['./alarm.css']
})
export class AlarmComponent implements OnDestroy {

  alarmTime: string = '';
  intervalId: any;
  isSet: boolean = false;

  showPopup: boolean = false;

  constructor(private sound: SoundService) {}

  setAlarm() {
    if (!this.alarmTime) return;

    this.isSet = true;

    this.intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0,5);

      if (currentTime === this.alarmTime) {
        this.triggerAlarm();
      }
    }, 1000);
  }

  triggerAlarm() {
    this.showPopup = true;
    this.sound.playBeepFor3Sec();

    this.clearAlarm();
  }

  closePopup() {
    this.showPopup = false;
    this.sound.stopBeep();
  }

  clearAlarm() {
    clearInterval(this.intervalId);
    this.isSet = false;
  }

  ngOnDestroy() {
    this.clearAlarm();
  }
}