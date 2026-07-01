// theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: string = 'dark-gold'; 

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(this.currentTheme);
    }
  }

  setTheme(theme: string) {
  
    this.renderer.removeClass(document.body, this.currentTheme);  
    this.renderer.addClass(document.body, theme);
    this.currentTheme = theme;
    localStorage.setItem('app-theme', theme);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}