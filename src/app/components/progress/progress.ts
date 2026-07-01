import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
selector: 'app-progress',
  standalone: true, 
  imports: [CommonModule, TranslatePipe], 
  templateUrl: './progress.html',
  styleUrls: ['./progress.css']
})
export class ProgressComponent implements OnChanges {

  @Input() count: number = 0;
  @Input() target: number = 108;

  percent: number = 0;

  radius: number = 70;
  circumference: number = 2 * Math.PI * 70;
  dashOffset: number = 0;

  ngOnChanges() {
    this.percent = Math.floor((this.count / this.target) * 100);

    const progress = Math.min(this.percent / 100, 1);
    this.dashOffset = this.circumference * (1 - progress);
  }
}