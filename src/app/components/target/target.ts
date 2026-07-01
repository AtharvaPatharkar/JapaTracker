import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-target',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './target.html',
  styleUrls: ['./target.css']
})
export class TargetComponent {

  @Input() mala: number = 0;

  targetMala: number = 1;

  // 🔥 MAIN FUNCTION (fixed)
  setTarget(input: HTMLInputElement) {
    const value = Number(input.value);

    if (value > 0) {
      this.targetMala = value;
      input.value = ''; // clear input
    }
  }

  get remaining(): number {
    return Math.max(0, this.targetMala - this.mala);
  }

  get isCompleted(): boolean {
    return this.mala >= this.targetMala;
  }

  onTargetInput(event: any) {
    const input = event.target;
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.startsWith('0')) {
      value = value.replace(/^0+/, '');
    }
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
    input.value = value;
  }

}