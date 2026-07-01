import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  private clickAudio: HTMLAudioElement | null = null;
  private malaAudio: HTMLAudioElement | null = null;
  private beepAudio: HTMLAudioElement | null = null;

  clickOn = true;
  malaOn = true;
  vibrateOn = true;
  clickVolume = 1;
  malaVolume = 1;

  constructor() {
    if (this.isBrowser) {
      this.clickAudio = new Audio('click.mp3');
      this.malaAudio = new Audio('mala.mp3');
      this.beepAudio = new Audio('beep.mp3');
    }
  }

  playClick() {
    if (!this.clickOn || !this.clickAudio) return;
    const sound = this.clickAudio.cloneNode() as HTMLAudioElement;
    sound.volume = this.clickVolume;
    sound.play().catch(() => { });
  }

  playMala() {
    if (!this.malaOn || !this.malaAudio) return;
    this.malaAudio.currentTime = 0;
    this.malaAudio.volume = this.malaVolume;
    this.malaAudio.play().catch(() => { });
  }

  playBeepFor3Sec() {
    if (!this.beepAudio) return;
    this.beepAudio.loop = true;
    this.beepAudio.volume = this.malaVolume;
    this.beepAudio.play().catch(() => { });
    setTimeout(() => this.stopBeep(), 3000);
  }

  vibrate() {
    if (this.vibrateOn && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  stopBeep() {
    if (this.beepAudio) {
      this.beepAudio.pause();
      this.beepAudio.currentTime = 0;
    }
  }

  toggleClick(val: boolean) { this.clickOn = val; }
  toggleMala(val: boolean) { this.malaOn = val; }
  toggleVibrate(val: boolean) { this.vibrateOn = val; }
  setClickVolume(val: number) { this.clickVolume = val; }
  setMalaVolume(val: number) { this.malaVolume = val; }

  private wakeLock: any = null;

  async toggleWakeLock(shouldLock: boolean) {
    if (!('wakeLock' in navigator)) return;

    try {
      if (shouldLock) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      } else {
        if (this.wakeLock) {
          await this.wakeLock.release();
          this.wakeLock = null;
        }
      }
    } catch (err) {
      console.error('Wake Lock Error:', err);
    }
  }



  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        // @ts-ignore
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock active! 🕯️');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }


  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Wake Lock released! 💤');
      } catch (err: any) {
        console.error(`Release Error: ${err.message}`);
      }
    }
  }
}