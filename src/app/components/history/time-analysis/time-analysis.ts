import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';

type ClockItem = {
  hour: number;
  count: number;
  intensity?: number;
};

@Component({
  selector: 'app-time-analysis',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './time-analysis.html',
  styleUrls: ['./time-analysis.css']
})
export class TimeAnalysis implements OnChanges {

  @Input() clockData: ClockItem[] = [];
  @Input() peakHour: string = '';

  processedData: ClockItem[] = [];

  maxCount: number = 0; 

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clockData']) {
      this.processData();
    }
  }

  // =========================
  // MAIN PROCESS
  // =========================


processData() {
  if (!this.clockData || this.clockData.length === 0) {
    this.processedData = this.generateEmpty24();
    this.peakHour = '';
    this.maxCount = 0;
    return;
  }

  const map = new Map<number, ClockItem>();
  this.clockData.forEach(item => {
    map.set(item.hour, { ...item });
  });

  const fullDay: ClockItem[] = [];
  for (let i = 0; i < 24; i++) {
    fullDay.push(
      map.get(i) || { hour: i, count: 0 }
    );
  }

  this.maxCount = Math.max(...fullDay.map(x => x.count));
  this.processedData = fullDay.map(item => ({
    ...item,
    intensity: this.maxCount > 0
      ?( Math.sqrt(item.count / this.maxCount) *0.50 )
      : 0
  }));

  if (this.maxCount > 0) {
    const peak = fullDay.reduce((a, b) => (b.count > a.count ? b : a));
    this.peakHour = this.formatHour(peak.hour);
  } else {
    this.peakHour = '';
  }

  console.log("🔥 Time Analysis Processed:", {
    max: this.maxCount,
    peak: this.peakHour,
    data: this.processedData
  });
}

  // =========================
  // EMPTY DATA
  // =========================
  generateEmpty24(): ClockItem[] {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      intensity: 0
    }));
  }

  // =========================
  // FORMAT HOUR
  // =========================
  formatHour(hour: number): string {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${suffix}`;
  }

  // =========================
  // TRACK BY
  // =========================
  trackByHour(index: number, item: ClockItem) {
    return item.hour;
  }

  // =========================
  // HEIGHT HELPER (for HTML)
  // =========================
  getHeight(val: number | undefined): number {
    return Math.max((val || 0) * 100, 3); // 🔥 visible minimum
  }
}