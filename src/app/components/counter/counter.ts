import { Component, EventEmitter, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundService } from '../../services/sound';

import { TranslatePipe } from '../../pipes/translate-pipe';
import { JapaStateService } from '../../services/japa-state';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './counter.html',
  styleUrls: ['./counter.css']
})
export class CounterComponent implements OnInit, OnDestroy {
  private sound = inject(SoundService);
  public state = inject(JapaStateService);
  private langService = inject(LanguageService);

  @Output() countChange = new EventEmitter<number>();
  @Output() targetChange = new EventEmitter<number>();


  get count() { return this.state.count; }
  get mala() { return this.state.mala; }
  get target() { return this.state.target; }

  private touchHandler: any;

  ngOnInit() {
    this.countChange.emit(this.state.count);
    this.targetChange.emit(this.state.target);

    this.touchHandler = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.no-copy')) { /* logic */ }
    };
    document.addEventListener('touchstart', this.touchHandler, { passive: true });
  }

  ngOnDestroy() {
    document.removeEventListener('touchstart', this.touchHandler);
  }

  increment() {
    if (this.state.isLimitReached) {
      this.state.count = 1;
      this.state.isLimitReached = false;
    } else {
      this.state.count++;
    }

    this.sound.playClick();
    this.sound.vibrate();

    if (this.state.count >= this.state.target) {
      this.state.mala++;
      this.state.isLimitReached = true;
      this.sound.playMala();
    }

    this.state.saveState();
    this.countChange.emit(this.state.count);
  }

  reset() {
    if (confirm("Are you sure you want to reset?")) {
      this.state.count = 0;
      this.state.mala = 0;
      this.state.isLimitReached = false;
      this.state.saveState();
      this.countChange.emit(0);
      localStorage.removeItem('main_japa_count');
    }
  }

  resetOnlyCount() {
    this.state.count = 0;
    this.state.isLimitReached = false;
    this.state.saveState();
    this.countChange.emit(0);
  }


  changeTarget(val: number) {
    const newTarget = (val > 0) ? val : 108;

    if (this.state.count > 0 || this.state.mala > 0) {


      if (newTarget > this.state.target) {
        alert(this.langService.getTranslate('target_increase_error'));
        return;
      }

      const confirmChange = confirm(this.langService.getTranslate('target_decrease_confirm'));
      if (!confirmChange) return;
    }

    this.state.target = newTarget;
    this.state.saveState();
    this.targetChange.emit(this.state.target);
    this.state.japaUpdated.next();
  }


  onTargetInput(event: any) {
  const input = event.target;
  let value = input.value.replace(/[^0-9]/g, '');

  if (value.startsWith('0')) {
    value = value.replace(/^0+/, '');
  }
  
  const maxLimit = 100000000;
  if (Number(value) > maxLimit) {
    value = maxLimit.toString();
  }

  input.value = value;
}
}