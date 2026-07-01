import { Component, OnInit, ChangeDetectorRef, HostListener, inject, effect } from '@angular/core';
import { ProgressComponent } from "../progress/progress";
import { CounterComponent } from "../counter/counter";
import { AutoclickComponent } from '../autoclick/autoclick';
import { TimerComponent } from "../timer/timer";
import { TargetComponent } from "../target/target";
import { SettingsComponent } from "../settings/settings";
import { ControlsComponent } from "../controls/controls";
import { AlarmComponent } from "../alarm/alarm";
import { AlmanacComponent } from "../almanac/almanac";
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FooterComponent } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { SoundService } from '../../services/sound';
import { ThemeService } from '../../services/theme';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';
import { JapaStateService } from '../../services/japa-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ProgressComponent, CounterComponent, AutoclickComponent, TimerComponent,
    TargetComponent, SettingsComponent, ControlsComponent, AlarmComponent,
    AlmanacComponent, RouterModule, FooterComponent, CommonModule, TranslatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // Services Injection
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sound = inject(SoundService);
  public themeService = inject(ThemeService);
  private langService = inject(LanguageService);
  public state = inject(JapaStateService);

  user: any = null;
  isGuest: boolean = false;
  isBatterySaver: boolean = false;

  currentCount: number = 0;
  currentTarget: number = 108;

  constructor() {
    effect(() => {
      const profile = this.auth.userProfile();
      if (profile) {
        this.isGuest = false;
        this.user = profile;
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('window:toggle-saver', ['$event'])
  onToggleSaver(event: any) {
    this.isBatterySaver = true;
    this.sound.requestWakeLock();
    this.cdr.detectChanges();
  }


async ngOnInit() {
  this.auth.authState$.subscribe(async (firebaseUser) => {
    if (firebaseUser) {
      this.isGuest = false;
      this.auth.setGuestMode(false);

      this.user = await this.auth.getCurrentUserAsync();
      
      if (this.user && this.user.uid) {
        this.state.loadState();
        this.currentCount = this.state.count;
        this.currentTarget = this.state.target;
        this.checkPendingJapa(this.user.uid);
      }
      this.cdr.detectChanges();
    } 
    else {
      this.isGuest = true;
      this.auth.setGuestMode(true);

      this.user = {
        name: 'Guest',
        uid: 'guest'
      };

      this.state.resetToDefault();
      this.currentCount = 0;
      this.currentTarget = 108;

      this.state.japaUpdated.next();
      this.cdr.detectChanges();
    }
  });

  this.state.japaUpdated.subscribe(() => {
    this.currentCount = this.state.count;
    this.currentTarget = this.state.target;
    this.cdr.detectChanges();
  });
}

  logout() {

    this.state.stopAutoclick();

    if (this.user && this.user.uid && !this.isGuest) {
      if (this.state.count > 0 || this.state.mala > 0) {
        const pending = {
          count: this.state.count,
          mala: this.state.mala,
          target: this.state.target,
          date: new Date().toISOString()
        };
        localStorage.setItem(`pending_japa_${this.user.uid}`, JSON.stringify(pending));
      }
    }

    localStorage.removeItem('main_japa_count');
    localStorage.removeItem('active_japa_session');
    this.state.resetToDefault();
    localStorage.removeItem('main_japa_count');
    this.auth.logout();
    this.auth.setGuestMode(false);
    this.router.navigate(['/login']);
  }

  private checkPendingJapa(uid: string) {
    const savedPending = localStorage.getItem(`pending_japa_${uid}`);
    if (savedPending) {
      const oldData = JSON.parse(savedPending);
      const msg = this.langService.getTranslate('unsaved_data_alert').replace('{{date}}', new Date(oldData.date).toLocaleDateString());

      if (confirm(msg)) {
        this.state.count = oldData.count;
        this.state.mala = oldData.mala;
        this.state.target = oldData.target;
        this.state.saveState();
        this.cdr.detectChanges();
      }
      localStorage.removeItem(`pending_japa_${uid}`);
    }
  }

  updateCount(newCount: number) {
    this.currentCount = newCount;
    this.cdr.detectChanges();
  }

  updateTarget(newTarget: number) {
    this.currentTarget = newTarget;
    this.cdr.detectChanges();
  }

  getGreetingKey() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  // logout() {
  //   if (this.user && this.user.uid && !this.isGuest) {
  //     if (this.state.count > 0 || this.state.mala > 0) {
  //       const pending = {
  //         count: this.state.count,
  //         mala: this.state.mala,
  //         target: this.state.target,
  //         date: new Date().toISOString()
  //       };
  //       localStorage.setItem(`pending_japa_${this.user.uid}`, JSON.stringify(pending));
  //     }
  //   }

  //   localStorage.removeItem('main_japa_count');
  //   localStorage.removeItem('active_japa_session');

  //   this.state.stopAutoclick();
  //   this.state.count = 0;
  //   this.state.mala = 0;
  //   this.state.isLimitReached = false;
  //   this.auth.setGuestMode(false);
  //   this.auth.logout();
  //   this.router.navigate(['/login']);
  // }

  toggleBatterySaver() {
    this.isBatterySaver = !this.isBatterySaver;
    this.applyBatterySaver();
  }

  handleBatterySaver(status: boolean) {
    this.isBatterySaver = status;
    this.applyBatterySaver();
  }

  private applyBatterySaver() {
    if (this.isBatterySaver) {
      document.body.classList.add('battery-saver-active');
      this.sound.requestWakeLock();
    } else {
      document.body.classList.remove('battery-saver-active');
      this.sound.releaseWakeLock();
    }
    this.cdr.detectChanges();
  }

  closeBatterySaver() {
    this.isBatterySaver = false;
    document.body.classList.remove('battery-saver-active');
    this.sound.releaseWakeLock();
    this.cdr.detectChanges();
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}