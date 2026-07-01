import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  images: string[] = [
    '/bg1.png',
    '/bg2.png',
    '/bg3.png',
    '/bg4.png',
    '/bg5.png'
  ];

  
  index: number = 0;



setBackground() {
  if (isPlatformBrowser(this.platformId)) {
    const bgUrl = `url('${this.images[this.index]}')`;
    const html = document.documentElement; 

    html.style.backgroundImage = bgUrl;
    html.style.backgroundRepeat = 'no-repeat';
    html.style.backgroundPosition = 'center center';
    html.style.backgroundAttachment = 'fixed'; 
    html.style.backgroundSize = 'cover';
    

    document.body.style.background = 'transparent'; 
  }
}
  nextBackground() {
    this.index = (this.index + 1) % this.images.length;
    this.setBackground();
  }
}