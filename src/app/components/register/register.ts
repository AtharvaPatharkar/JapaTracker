import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { FooterComponent } from "../footer/footer";
import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, FooterComponent, TranslatePipe],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class RegisterComponent implements OnInit {

  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  error = '';
  loading = false;
  isSaving = false;

  constructor(private auth: AuthService, private router: Router, public langService: LanguageService) {}

  ngOnInit() {
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
  }

  async register() {
    if (this.user.password !== this.user.confirmPassword) {
      this.error = this.langService.getTranslate('err_pw_match');
      return;
    }

    if (!this.user.name || !this.user.email || !this.user.password) {
     this.error = this.langService.getTranslate('err_all_fields');
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const success = await this.auth.register(this.user);

      if (success) {
        const pendingData = localStorage.getItem('pendingJapa');
        
        if (pendingData) {
          try {
            const data = JSON.parse(pendingData);
            if (!data.date) data.date = new Date().toISOString();

            await this.auth.saveJapa(data); 
            localStorage.removeItem('pendingJapa'); 
           alert(this.langService.getTranslate('msg_reg_save_success'));
          } catch (err) {
            alert(this.langService.getTranslate('msg_save_err'));
          }
        } else {
        alert(this.langService.getTranslate('msg_reg_success'));
        }

        this.auth.setGuestMode(false);
        this.router.navigate(['/dashboard']);
      }

    } catch (err: any) {
      this.error = err.message || "Something went wrong";
    } finally {
      this.loading = false;
    }
  }
}