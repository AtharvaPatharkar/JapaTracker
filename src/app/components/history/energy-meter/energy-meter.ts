import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';

@Component({
  selector: 'app-energy-meter',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './energy-meter.html',
  styleUrls: ['./energy-meter.css']
})
export class EnergyMeter implements OnChanges {

  // =========================
  // INPUT
  // =========================
  @Input() vibrationalFreq: number = 0;   // raw value
  @Input() energyState: string = '';      // optional override
  @Input() auraColor: string = '';        // optional override

  // =========================
  // INTERNAL STATE
  // =========================
  normalizedFreq = 0;   // 0–100 UI value
  computedState = '';
  computedColor = '';


  constructor(private langService: LanguageService) { }
  // =========================
  // LIFECYCLE
  // =========================
  ngOnChanges(changes: SimpleChanges) {
    this.processEnergy();
  }

  // =========================
  // CORE PROCESS
  // =========================
  processEnergy() {

    // normalize (0–100 clamp)
    this.normalizedFreq = this.clamp(this.vibrationalFreq);

    // auto state (if not provided)
    if (!this.energyState) {
      this.computedState = this.getState(this.normalizedFreq);
    } else {
      this.computedState = this.energyState;
    }

    // auto color (if not provided)
    if (!this.auraColor) {
      this.computedColor = this.getColor(this.normalizedFreq);
    } else {
      this.computedColor = this.auraColor;
    }
  }

  // =========================
  // STATE LOGIC
  // =========================
  getState(val: number): string {
    if (val >= 80) return 'state_high';
    if (val >= 50) return 'state_balanced';
    if (val >= 25) return 'state_low';
    return 'state_very_low';
  }

  // =========================
  // COLOR LOGIC
  // =========================
  getColor(val: number): string {
    if (val >= 80) return '#22c55e'; // green
    if (val >= 50) return '#f59e0b'; // yellow
    if (val >= 25) return '#f97316'; // orange
    return '#ef4444';                // red
  }

  // =========================
  // CLAMP
  // =========================
  clamp(v: number): number {
    return Math.max(0, Math.min(v || 0, 100));
  }

  // =========================
  // DISPLAY HELPERS
  // =========================
  get displayFreq(): number {
    return this.normalizedFreq;
  }

  get displayState(): string {
    return this.computedState;
  }

  get displayColor(): string {
    return this.computedColor;
  }

}