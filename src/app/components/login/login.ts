import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { FooterComponent } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, FooterComponent, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  error = '';
  loading = false;
  isSaving = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef, private langService: LanguageService) { }

  async ngOnInit() {

    this.cdr.detectChanges();
    const user = await this.auth.getCurrentUserAsync();
    if (user) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const pendingData = localStorage.getItem('pendingJapa');
    if (pendingData) {
      const data = JSON.parse(pendingData);
      const dataTime = new Date(data.date).getTime();
      const now = new Date().getTime();

      if (now - dataTime > 30 * 60 * 1000) {
        localStorage.removeItem('pendingJapa');
        this.isSaving = false;
      } else {
        this.isSaving = true;
      }
    }

    this.cdr.detectChanges();
  }

  // =========================
  // 🔥 LOGIN FUNCTION
  // =========================
  async login() {
    if (!this.email || !this.password) {
      this.error = this.langService.getTranslate('err_missing_fields');
      return;
    }

    this.error = '';
    this.loading = true;

    try {
      const res = await this.auth.login(this.email, this.password);

      if (res.success) {
        const pendingData = localStorage.getItem('pendingJapa');

        if (pendingData) {
          try {
            const data = JSON.parse(pendingData);
            if (!data.date) data.date = new Date().toISOString();

            await this.auth.saveJapa(data);
            localStorage.removeItem('pendingJapa');
            alert(this.langService.getTranslate('msg_save_success'));
          } catch (err) {
            console.error("Error saving pending japa:", err);
          }
        }

        this.auth.setGuestMode(false);
        this.router.navigate(['/dashboard']);

      } else {
      switch (res.error) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          alert(this.langService.getTranslate('err_invalid_auth'));
          break;
        case 'auth/invalid-email':
          alert(this.langService.getTranslate('err_invalid_email'));
          break;
        case 'auth/too-many-requests':
          alert(this.langService.getTranslate('err_too_many_attempts'));
          break;
        case 'account-deleted':
          alert(this.langService.getTranslate('err_account_deleted'));
          break;
        default:
          alert(this.langService.getTranslate('err_login_failed'));
      }
    }
} catch (e) {
    this.error = this.langService.getTranslate('err_something_wrong');
    console.error(e);
  } finally {
    this.loading = false;
  }
  }

  japaWithoutLogin() {
  const confirmBox = confirm(this.langService.getTranslate('confirm_guest'));
    if (confirmBox) {
      this.auth.setGuestMode(true);
      this.router.navigate(['/dashboard']);
    }
  }

  async goAdmin() {
    const isAdmin = await this.auth.isAdmin();
    if (isAdmin) {
      this.router.navigate(['/admin']);
    } else {
alert(this.langService.getTranslate('err_admin_only'));
    }
  }

  cancelSave() {
  const confirmCancel = confirm(this.langService.getTranslate('confirm_cancel_save'));
    if (confirmCancel) {
      localStorage.removeItem('pendingJapa');
      this.isSaving = false;
      window.location.reload();
    }
  }
}