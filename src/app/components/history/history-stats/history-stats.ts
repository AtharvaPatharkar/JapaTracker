import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';

@Component({
  selector: 'app-history-stats',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './history-stats.html',
  styleUrls: ['./history-stats.css']
})
export class HistoryStats {

  @Input() totalMala: number = 0;
  @Input() totalCount: number = 0;
  @Input() currentStreak: number = 0;
  @Input() longestStreak: number = 0;

}