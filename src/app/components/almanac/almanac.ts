import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-almanac',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './almanac.html',
  styleUrls: ['./almanac.css']
})
export class AlmanacComponent implements OnDestroy {

  today: Date = new Date();
  currentTime: string = '';
  intervalId: any;

  animate: boolean = false;

  constructor(private cdr: ChangeDetectorRef, public langService: LanguageService) {

    // initial time
    this.updateTime();

    // 🔥 main fix
    this.intervalId = setInterval(() => {

      this.updateTime();

      // animation trigger
      this.animate = false;

      setTimeout(() => {
        this.animate = true;
      }, 10);

      // 🔥 FORCE UI UPDATE (MOST IMPORTANT)
      this.cdr.detectChanges();

    }, 1000);
  }

updateTime() {
    this.currentTime = new Date().toLocaleTimeString(this.langService.getCurrentLang());
  }

get formattedDate(): string {
    return this.today.toLocaleDateString(this.langService.getCurrentLang());
  }

get dayName(): string {
    return this.today.toLocaleDateString(this.langService.getCurrentLang(), { weekday: 'long' });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}