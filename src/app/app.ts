import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from "./components/dashboard/dashboard";
import { BackgroundService } from './services/background';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {

  constructor(private bg: BackgroundService) {}

  ngOnInit() {
  this.bg.setBackground();
}
  protected readonly title = signal('JapaTracker');
}
