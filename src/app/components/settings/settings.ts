import { Component, inject, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundService } from '../../services/background';
import { SoundService } from '../../services/sound';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {
  private bg = inject(BackgroundService);
  private sound = inject(SoundService);
  private cdr = inject(ChangeDetectorRef);
  private langService = inject(LanguageService); // ✅ Inject
  private themeService = inject(ThemeService);

  @Input() isBatterySaver: boolean = false; 
  @Output() batterySaverToggle = new EventEmitter<boolean>(); 
  isDarkMode = false;
  clickOn = this.sound.clickOn;
  malaOn = this.sound.malaOn;
  vibrateOn = this.sound.vibrateOn;
  clickVolume = this.sound.clickVolume;
  malaVolume = this.sound.malaVolume;
  isMobile = false;
  currentLang = 'mr';
  openSection: string = 'appearance';

ngOnInit() {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.currentLang = this.langService.getCurrentLang(); 

  }

  toggleSection(section: string) {
  this.openSection = this.openSection === section ? '' : section;
  this.cdr.detectChanges();
}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.style.filter = this.isDarkMode ? "brightness(0.7)" : "brightness(1)";
  }

  toggleClick() {
    this.clickOn = !this.clickOn;
    this.sound.toggleClick(this.clickOn);
    if (this.clickOn) this.sound.playClick();
  }

  toggleMala() {
    this.malaOn = !this.malaOn;
    this.sound.toggleMala(this.malaOn);
  }

  toggleVibrate() {
    this.vibrateOn = !this.vibrateOn;
    this.sound.toggleVibrate(this.vibrateOn);
  }

  changeClickVolume(val: number) {
    this.clickVolume = val;
    this.sound.setClickVolume(val);
  }

  changeMalaVolume(val: number) {
    this.malaVolume = val;
    this.sound.setMalaVolume(val);
  }

  changeBg() {
    this.bg.nextBackground();
    this.cdr.detectChanges();
  }

  disableBatterySaver() {
    this.isBatterySaver = false;
    this.sound.toggleWakeLock(false);
    document.body.classList.remove('battery-saver-active');
  }

toggleBatterySaver() {
    this.isBatterySaver = !this.isBatterySaver;
    this.batterySaverToggle.emit(this.isBatterySaver);
  }

  changeLang(lang: string) {
    this.langService.setLanguage(lang);
    this.currentLang = lang;
    this.cdr.detectChanges();
  }


  rotateTheme() {
    const themes = ['dark-gold', 'classic-light', 'deep-ocean'];
    const current = this.themeService.getCurrentTheme();
    let nextIndex = (themes.indexOf(current) + 1) % themes.length;
    
    const nextTheme = themes[nextIndex];
    this.themeService.setTheme(nextTheme);
    if (nextTheme === 'classic-light') {
      document.documentElement.style.filter = "brightness(1)";
    } else {
      document.documentElement.style.filter = "brightness(0.9)";
    }
  }
}