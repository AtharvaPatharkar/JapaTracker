import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';

@Component({
  selector: 'app-focus-meter',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './focus-meter.html',
  styleUrls: ['./focus-meter.css']
})
export class FocusMeter implements OnChanges {

 @Input() focusScore: number = 0; 
  @Input() focusGrade: string = '';
  @Input() focusTip: string = '';

  progress: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['focusScore']) {
      const score = changes['focusScore'].currentValue;
      this.progress = Math.max(0, Math.min(score || 0, 100));
    }
  }

  getColor(): string {
    if (this.progress >= 80) return '#22c55e'; // Green
    if (this.progress >= 50) return '#f59e0b'; // Yellow/Orange
    return '#ef4444';                         // Red
  }
}