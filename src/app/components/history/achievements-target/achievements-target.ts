import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';

@Component({
  selector: 'app-achievements-target',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './achievements-target.html',
  styleUrls: ['./achievements-target.css']
})
export class AchievementsTarget {

  @Input() achievementList: any[] = [];
  @Input() targetStreak: number = 0;
  @Input() longestStreak: number = 0;
  @Input() malasToNextTarget: number = 0;

}