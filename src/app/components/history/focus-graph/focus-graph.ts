import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';

@Component({
  selector: 'app-focus-graph',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './focus-graph.html',
  styleUrls: ['./focus-graph.css']
})
export class FocusGraph implements OnChanges {

  @Input() data: any[] = [];

  labels: string[] = [];
  smoothScores: number[] = [];

  avg = 0;
  best = 0;
  worst = 0;
  consistency = 0;
  trend: 'up' | 'down' | 'flat' = 'flat';


  // ✅ RANGE OPTIONS (All Time added)
  ranges = [
   { label: 'range_all', value: 0 },   // 🔥 default
    { label: '7D', value: 7 },
    { label: '1M', value: 30 },
    { label: '3M', value: 90 },
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
    { label: '2Y', value: 730 },
    { label: '5Y', value: 1825 }
  ];

  selectedRange = 0; // 🔥 default = ALL TIME


  constructor(private langService: LanguageService) {}

  changeRange(days: number) {
    this.selectedRange = days;
    this.process();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) this.process();
  }


// =========================
// MAIN PROCESS
// =========================
process() {
  if (!this.data || this.data.length === 0) {
    this.reset();
    return;
  }

  const now = new Date();

  // =========================
  // 1. FILTER & VALIDATE DATES
  // =========================
  const filteredData = this.selectedRange === 0
    ? this.data
    : this.data.filter(item => {
        if (!item.date) return false; // तारीख नसल्यास फिल्टर करा
        const d = item.date?.toDate ? item.date.toDate() : new Date(item.date);
        
        if (isNaN(d.getTime())) return false; // Invalid Date असेल तर स्किप करा

        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= this.selectedRange;
      });

  if (!filteredData.length) {
    this.reset();
    return;
  }

  // =========================
  // 2. GROUP BY DATE (SUM)
  // =========================
  const grouped: Record<string, { date: Date; sum: number }> = {};

  filteredData.forEach(item => {
    const d: Date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    
    // सुरक्षितता: जर तारीख Invalid असेल तर आजची तारीख वापरा किंवा लूप स्किप करा
    if (isNaN(d.getTime())) return; 

    const key = d.toISOString().split('T')[0];
    const score = Math.min(Number(item.score) || 0, 100);

    if (!grouped[key]) {
      grouped[key] = { date: d, sum: 0 };
    }

    grouped[key].sum += score;
  });

  // =========================
  // 3. SORT
  // =========================
  const sorted = Object.values(grouped)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (!sorted.length) {
    this.reset();
    return;
  }

  // =========================
  // 4. DAILY SCORES (SUM)
  // =========================
  const dailyScores = sorted.map(d => Math.min(d.sum, 100));

  // =========================
  // 5. LABELS
  // =========================
  this.labels = sorted.map(d =>
    d.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  );

  // =========================
  // 6. SMOOTHING (Moving Average)
  // =========================
  this.smoothScores = this.movingAverage(dailyScores, 2);
  const s = this.smoothScores.length ? this.smoothScores : [0];

  // =========================
  // 7. STATS
  // =========================
  this.avg = Math.round(s.reduce((a, b) => a + b, 0) / s.length);
  this.best = Math.max(...s);
  this.worst = Math.min(...s);

  // =========================
  // 8. TREND
  // =========================
  const diff = s[s.length - 1] - (s.length > 1 ? s[0] : s[s.length - 1]);
  this.trend = diff > 5 ? 'up' : diff < -5 ? 'down' : 'flat';

  // =========================
  // 9. CONSISTENCY
  // =========================
  this.consistency = Math.max(
    0,
    100 - Math.round((this.best - this.worst) / 2)
  );
}

  // =========================
  // HELPERS
  // =========================
  movingAverage(arr: number[], window: number) {
    return arr.map((_, i) => {
      const subset = arr.slice(Math.max(0, i - window + 1), i + 1);
      return Math.round(subset.reduce((a, b) => a + b, 0) / subset.length);
    });
  }

  getViewBox(): string {
    const width = Math.max(400, this.smoothScores.length * 50);
    return `0 0 ${width} 100`;
  }

  getLinePoints(): string {
    if (!this.smoothScores.length) return '';

    const gap = 50;
    const width = Math.max(400, this.smoothScores.length * gap);

    return this.smoothScores.map((val, i) => {
      const x = ((i / (this.smoothScores.length - 1 || 1)) * (width - 60)) + 30;
      const y = 90 - ((val / 100) * 80);
      return (i === 0 ? 'M ' : ' L ') + `${x} ${y}`;
    }).join(' ');
  }

  getTrendColor() {
    return this.trend === 'up'
      ? '#22c55e'
      : this.trend === 'down'
      ? '#ef4444'
      : '#64748b';
  }

  getTrendIcon() {
    return this.trend === 'up'
      ? '📈'
      : this.trend === 'down'
      ? '📉'
      : '➖';
  }

  reset() {
    this.labels = [];
    this.smoothScores = [];
    this.avg = 0;
    this.best = 0;
    this.worst = 0;
    this.consistency = 0;
    this.trend = 'flat';
  }

  getTrendText(): string {
    return this.langService.getTranslate(`trend_${this.trend}`);
  }
}