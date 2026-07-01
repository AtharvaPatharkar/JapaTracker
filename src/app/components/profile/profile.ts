import { Component, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { FooterComponent } from '../footer/footer';
import { ThemeService } from '../../services/theme';
import { LanguageService } from '../../services/language';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageCropperComponent, FooterComponent, TranslatePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class ProfileComponent {

  user: any = {}; // ✅ keep as any (no logic change)
  editMode = false;

  profileImage: string = '';

  imageChangedEvent: any = '';
  croppedImage: string = '';
  showCropper = false;

  loading = true;

  constructor(
    public auth: AuthService,
    private router: Router,
    public themeService: ThemeService,
    private cd: ChangeDetectorRef,
    public langService: LanguageService,
  ) {
    // Reactively sync with central userProfile signal state
    effect(() => {
      const profile = this.auth.userProfile();
      if (profile) {
        if (!this.editMode) {
          this.user = { ...profile };
          this.profileImage = profile.profileImage || '';
        }
      }
      this.loading = this.auth.loadingProfile();
      this.cd.detectChanges();
    });
  }

  changeAppTheme(themeName: string) {
    this.themeService.setTheme(themeName);
  }

  changeLanguage(lang: string) {
    this.langService.setLanguage(lang);
    this.cd.detectChanges();
  }

  get initials(): string {
    if (this.user?.name) {
      return this.user.name.charAt(0).toUpperCase();
    }
    if (this.user?.email) {
      return this.user.email.split('@')[0].charAt(0).toUpperCase();
    }
    return '?';
  }

  onImageError() {
    this.profileImage = ''; // Falls back to initials avatar
    this.cd.detectChanges();
  }

  ngOnInit() {
    // Centralized state handles loading, but sync a copy initially if signal already loaded
    const profile = this.auth.userProfile();
    if (profile) {
      this.user = { ...profile };
      this.profileImage = profile.profileImage || '';
    }
    this.loading = this.auth.loadingProfile();
    this.cd.detectChanges();
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  // 📸 Select image
  onImageChange(event: any) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  // ✂️ Crop
  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.croppedImage = event.base64;
    } else if (event.objectUrl) {
      this.croppedImage = event.objectUrl;
    }
  }

  // 💾 Save cropped
  saveCroppedImage() {
    if (!this.croppedImage) return;

    this.profileImage = this.croppedImage;
    this.showCropper = false;
  }


  async saveProfile() {
    try {
      let imageUrl = this.profileImage;

      if (this.profileImage && this.profileImage.startsWith('data:image')) {
        console.log("Uploading to Firebase Storage...");
        imageUrl = await this.auth.uploadProfileImage(this.profileImage);
        console.log("Received Firebase URL:", imageUrl);
      }

      const updatedUser = {
        ...this.user,
        profileImage: imageUrl || '',
        lastActive: new Date().toISOString()
      };

      await this.auth.updateUser(updatedUser);

      localStorage.setItem('user_profile_data', JSON.stringify(updatedUser));
      this.user = updatedUser;
      this.profileImage = imageUrl;
      this.editMode = false;

      alert(this.langService.getTranslate('profile_update_success')); this.cd.detectChanges();

    } catch (error) {
      console.error("Save failed:", error);
      alert(this.langService.getTranslate('profile_update_error'));
    }
  }

  async deleteAccount() {

    const confirmDelete = confirm("Delete account?");
    if (!confirmDelete) return;

    const user = this.auth.getCurrentUser();
    if (!user) return;

    await this.auth.updateUser({
      deletedAt: new Date().toISOString()
    });

    alert(this.langService.getTranslate('account_deleted_msg'));
    this.auth.logout();
    this.router.navigate(['/login']);
  }


  showPasswordModal = false;
  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  async updatePassword() {
    if (!this.passwords.current || !this.passwords.new || !this.passwords.confirm) {
      alert(this.langService.getTranslate('fill_all_fields'));
      return;
    }

    if (this.passwords.new !== this.passwords.confirm) {
      alert(this.langService.getTranslate('password_mismatch'));
      return;
    }

    if (this.passwords.new.length < 6) {
      alert(this.langService.getTranslate('password_too_short'));
      return;
    }

    try {
      const res = await this.auth.changePassword(this.passwords.current, this.passwords.new);

      if (res.success) {
        this.showPasswordModal = false;
        this.passwords = { current: '', new: '', confirm: '' };
        this.cd.detectChanges();

        setTimeout(() => {
          alert(this.langService.getTranslate('password_change_success'));
        }, 100);
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        alert(this.langService.getTranslate('wrong_old_password'));
      } else {
        alert(this.langService.getTranslate('technical_error'));
      }
    }
  }
  logout() {
    const confirmLogout = confirm(this.langService.getTranslate('logout_confirm_msg'));
    if (confirmLogout) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}