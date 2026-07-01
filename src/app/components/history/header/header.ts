import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HistoryHeader implements OnInit, OnDestroy {

  @Output() back = new EventEmitter<void>();

  currentDateRange: string = '';

  accountJoinedDate: Date = new Date();

  // ✅ subscription safely handle
  private langSubscription: Subscription | null = null;

  constructor(
    private langService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {

    try {

      // ✅ user profile safely load
      const profile = await this.authService.getUserProfile();

      if (profile && profile['createdAt']) {

        this.accountJoinedDate =
          new Date(profile['createdAt']);
      }

    } catch (error) {

      console.error(
        'Error loading profile:',
        error
      );
    }

    // ✅ initial update
    this.updateDateRange();

    // ✅ SAFE subscribe
    if (this.langService?.selectedLang$) {

      this.langSubscription =
        this.langService.selectedLang$
          .subscribe(() => {

            this.updateDateRange();

          });
    }
  }

  // ✅ prevent memory leaks
  ngOnDestroy() {

    this.langSubscription?.unsubscribe();
  }

  onBack() {

    this.back.emit();
  }

  onProfile() {

    this.router.navigate(['/profile']);
  }

  updateDateRange() {

    try {

      const now = new Date();

      const langCode =
        this.langService.getCurrentLang();

      const toLabel =
        this.langService.getTranslate('date_to_label')
        || '-';

      // Start Date
      const startDay =
        this.accountJoinedDate.getDate();

      const startMonth =
        this.accountJoinedDate.toLocaleString(
          langCode,
          { month: 'short' }
        );

      // End Date
      const endDay =
        now.getDate();

      const endMonth =
        now.toLocaleString(
          langCode,
          { month: 'short' }
        );

      const year =
        now.getFullYear();

      this.currentDateRange =
        `${startDay} ${startMonth} ${toLabel} ${endDay} ${endMonth} ${year}`;

    } catch (error) {

      console.error(
        'Date range update error:',
        error
      );
    }
  }
}