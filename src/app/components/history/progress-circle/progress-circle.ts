import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';

@Component({
  selector: 'app-progress-circle',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './progress-circle.html',
  styleUrls: ['./progress-circle.css']
})
export class ProgressCircle implements OnChanges {

  // =========================
  // INPUT
  // =========================
  @Input() totalCount: number = 0;

  // =========================
  // STATE
  // =========================
  progress = 0;
  currentMilestone = 0;
  nextMilestone = 0;
  remaining = 0;

  // milestone steps
  milestones = [0,100, 500, 1000, 5000, 10000, 50000, 100000,
                200000,300000,400000,500000,600000,700000,
                800000,900000,100000,1200000,1500000,1750000,
                2000000,2500000,3000000,3500000,4000000,5000000,
                6000000,7000000,8000000,9000000,10000000,12000000,
                15000000,30000000,50000000,100000000,200000000,
                300000000,400000000,500000000,1000000000,2000000000,
                5000000000,10000000000];

  // circle constant
  circumference = 2 * Math.PI * 52;

  // =========================
  // UPDATE
  // =========================
  ngOnChanges() {
    this.calculateProgress();
  }

  // =========================
  // CORE LOGIC
  // =========================
  calculateProgress() {

    if (!this.totalCount || this.totalCount <= 0) {
      this.reset();
      return;
    }

    // find milestone range
    for (let i = 0; i < this.milestones.length; i++) {

      if (this.totalCount < this.milestones[i]) {

        this.nextMilestone = this.milestones[i];
        this.currentMilestone = this.milestones[i - 1] || 0;

        break;
      }

      // if max reached
      if (i === this.milestones.length - 1) {
        this.currentMilestone = this.milestones[i];
        this.nextMilestone = this.milestones[i];
      }
    }

    // progress %
    const range = this.nextMilestone - this.currentMilestone;
    const current = this.totalCount - this.currentMilestone;

    this.progress = range > 0
      ? Math.round((current / range) * 100)
      : 100;

    // remaining
    this.remaining = this.nextMilestone - this.totalCount;

    if (this.remaining < 0) this.remaining = 0;
  }

  // =========================
  // RESET
  // =========================
  reset() {
    this.progress = 0;
    this.currentMilestone = 0;
    this.nextMilestone = this.milestones[0];
    this.remaining = this.nextMilestone;
  }

  // =========================
  // STROKE OFFSET
  // =========================
  getOffset(): number {
    return this.circumference - (this.circumference * this.progress / 100);
  }

  // =========================
  // COLOR LOGIC
  // =========================
  getColor(): string {
    if (this.progress >= 80) return '#22c55e'; // green
    if (this.progress >= 40) return '#f59e0b'; // yellow
    return '#3b82f6';                          // blue
  }

  // =========================
  // LABEL FORMAT
  // =========================
formatNumber(val: number): string {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000) + 'k';
    return val.toString();
  }

}