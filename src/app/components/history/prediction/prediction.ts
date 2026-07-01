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
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './prediction.html',
  styleUrls: ['./prediction.css']
})
export class Prediction implements OnChanges {

  // =========================
  // INPUT
  // =========================
  @Input() daysToReach: number = 0;
  @Input() levelName: string = '';

  @Input() nextTarget: number = 0;

  // =========================
  // INTERNAL STATE
  // =========================
  normalizedDays = 0;
  urgency: 'high' | 'medium' | 'low' = 'low';
  confidence = 0;
  message = '';

  constructor(private langService: LanguageService) { }


  // =========================
  // LIFECYCLE
  // =========================
  ngOnChanges(changes: SimpleChanges) {
    this.processPrediction();
  }

  // =========================
  // CORE LOGIC
  // =========================
  processPrediction() {

    // normalize (no negative / NaN)
    this.normalizedDays = this.sanitize(this.daysToReach);

    // urgency level
    this.urgency = this.getUrgency(this.normalizedDays);

    // confidence (heuristic)
    this.confidence = this.getConfidence(this.normalizedDays);

    // message
    this.message = this.getMessage(this.normalizedDays, this.urgency);
  }

  // =========================
  // SANITIZE INPUT
  // =========================
  sanitize(val: number): number {
    if (!val || isNaN(val)) return 0;
    return Math.max(0, Math.round(val));
  }

  // =========================
  // URGENCY LOGIC
  // =========================
  getUrgency(days: number): 'high' | 'medium' | 'low' {
    if (days <= 3) return 'high';
    if (days <= 10) return 'medium';
    return 'low';
  }

  // =========================
  // CONFIDENCE (simple heuristic)
  // =========================
  getConfidence(days: number): number {
    if (days === 0) return 100;
    if (days <= 3) return 95;
    if (days <= 10) return 80;
    return 60;
  }

  // =========================
  // MESSAGE ENGINE
  // =========================
  getMessage(days: number, urgency: string): string {
    if (days === 0) {
      return this.langService.getTranslate('msg_goal_reached');
    }
    if (urgency === 'high') {
      return this.langService.getTranslate('msg_very_close');
    }
    if (urgency === 'medium') {
      return this.langService.getTranslate('msg_good_progress');
    }
    return this.langService.getTranslate('msg_keep_going');
  }

  // =========================
  // COLOR (UI binding)
  // =========================
  getColor(): string {
    if (this.urgency === 'high') return '#22c55e';   // green
    if (this.urgency === 'medium') return '#f59e0b'; // yellow
    return '#6366f1';                                // calm blue
  }

  // =========================
  // PROGRESS SCALE (for UI)
  // =========================
  getProgress(): number {
    // inverse scale: fewer days → higher progress
    const max = 30;
    return Math.max(0, Math.min(100, 100 - (this.normalizedDays / max) * 100));
  }

  // =========================
  // DISPLAY HELPERS
  // =========================
  get displayDays(): number {
    return this.normalizedDays;
  }

  get displayLevel(): string {
    return this.levelName || 'Unknown Level';
  }

  get displayMessage(): string {
    return this.message;
  }

  get projectedDate(): string {
    if (this.daysToReach === 0) return this.langService.getTranslate('today_label') + '!';

    const date = new Date();
    date.setDate(date.getDate() + this.daysToReach);


    const langCode = this.langService.getCurrentLang();
    return date.toLocaleDateString(langCode === 'mr' ? 'mr-IN' : (langCode === 'hi' ? 'hi-IN' : 'en-GB'), {
      day: 'numeric',
      month: 'short'
    });
  }


  get finalProjectedMessage(): string {
    // १. डिक्शनरीमधून मेसेज मिळवा (उदा. "तुमचे ध्येय {date} पर्यंत पूर्ण होऊ शकते!")
    const rawMsg = this.langService.getTranslate('projected_date_msg');

    // २. {date} ला प्रत्यक्ष तारखेने (projectedDate) रिप्लेस करा
    return rawMsg.replace('{date}', this.projectedDate);
  }
}