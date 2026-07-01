import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { JapaStateService } from '../../services/japa-state';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './controls.html',
  styleUrls: ['./controls.css']
})
export class ControlsComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  public state = inject(JapaStateService);
  private langService = inject(LanguageService);

  @Input() resetFunction!: () => void;
  @Input() isGuest: boolean = false;
  @Output() stopAutoEvent = new EventEmitter<void>();

  // डेटा सेव्ह होत असताना बटण डिसेबल करण्यासाठी
  public isSaving: boolean = false;

  private resetAllToDefault() {
    this.state.stopAutoclick();
    this.stopAutoEvent.emit();
    this.state.count = 0;
    this.state.mala = 0;
    this.state.isLimitReached = false;
    this.state.target = 108;
    this.state.autoTargetMala = null;
    this.state.autoRemainingMala = 0;
    this.state.saveState();
  }

  async saveData() {
    // १. व्हॅलिडेशन: किमान १ माळ हवी
    if (this.state.mala < 1) {
      alert(this.langService.getTranslate('min_japa_error'));
      return;
    }

    // २. गेस्ट असेल तर त्याला लॉगिन करायला सांगा
    if (this.isGuest) {
      alert(this.langService.getTranslate('login_to_save_japa'));
      return;
    }

    // ३. डुप्लिकेट क्लिक रोखण्यासाठी चेक
    if (this.isSaving) return;
    this.isSaving = true;

    const currentUser = this.auth.getCurrentUser();
    const data = {
      count: this.state.count,
      mala: this.state.mala,
      target: this.state.target,
      totalJapa: (Number(this.state.mala) * Number(this.state.target)) + Number(this.state.count),
      date: new Date().toISOString()
    };

    // ४. इंटरनेट कनेक्शन तपासा (Offline Handling)
    if (!navigator.onLine) {
      if (currentUser) {
        // ऑफलाइन असल्यास लोकल स्टोरेज मध्ये सेव्ह करा
        localStorage.setItem(`pending_japa_${currentUser.uid}`, JSON.stringify(data));
        alert(this.langService.getTranslate('offline_save_success') || "डेटा ऑफलाइन जतन केला आहे.");
      }
      this.resetAllToDefault();
      this.isSaving = false;
      return;
    }

    // ५. ऑनलाइन असल्यास फायरबेसवर सेव्ह करा
    try {
      console.log("Saving data to Firebase...");
      await this.auth.saveJapa(data);
      this.resetAllToDefault();

      setTimeout(() => {
        this.isSaving = false;
        this.router.navigate(['/history']);
      }, 500);
    } catch (error) {
      console.error("Save error:", error);
      alert(this.langService.getTranslate('err_save_failed'));
      this.isSaving = false;
    }
  }

  goToLoginToSave() {
    if (this.state.mala < 1) {
      alert(this.langService.getTranslate('min_japa_error'));
      return;
    }

    const guestData = {
      count: this.state.count,
      mala: this.state.mala,
      target: this.state.target,
      totalJapa: (Number(this.state.mala) * Number(this.state.target)) + Number(this.state.count),
      date: new Date().toISOString()
    };

    localStorage.setItem('pendingJapa', JSON.stringify(guestData));
    this.resetAllToDefault();
    this.router.navigate(['/login']);
  }

  restart() {
    const msg = this.langService.getTranslate('confirm_reset_msg') || "Are you sure you want to reset?";
    if (confirm(msg)) {
      this.resetAllToDefault();
      if (this.resetFunction) {
        this.resetFunction();
      }
    }
  }

  logout() {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser && (this.state.count > 0 || this.state.mala > 0)) {
      const pendingData = {
        count: this.state.count,
        mala: this.state.mala,
        target: this.state.target,
        date: new Date().toISOString()
      };
      localStorage.setItem(`pending_japa_${currentUser.uid}`, JSON.stringify(pendingData));
    }

    this.resetAllToDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}