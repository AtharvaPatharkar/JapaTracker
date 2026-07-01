import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile';
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language';
import { ThemeService } from '../../services/theme';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { signal } from '@angular/core';

const currentTheme = signal('light');

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const profileSignal = signal({
    uid: '123',
    name: 'User',
    email: 'test@example.com',
    profileImage: ''
  });

  const loadingSignal = signal(false);

  const authServiceMock = {
    isLoggedIn: () => true,

    // Angular Signals
    userProfile: profileSignal,

    loadingProfile: loadingSignal,

    getCurrentUser: () => ({
      uid: '123',
      email: 'test@example.com'
    }),

    getCurrentUserAsync: () =>
      Promise.resolve({
        uid: '123',
        name: 'User'
      }),

    getUserProfile: () =>
      Promise.resolve({
        uid: '123',
        name: 'User',
        email: 'test@example.com',
        profileImage: ''
      }),

    uploadProfileImage: () =>
      Promise.resolve('https://example.com/profile.jpg'),

    updateUser: () => Promise.resolve(),

    changePassword: () =>
      Promise.resolve({
        success: true
      }),

    logout: () => Promise.resolve()
  };

  const langServiceMock = {
    getTranslate: (key: string) => key,
    getCurrentLang: () => 'mr',
    setLanguage: () => {}
  };

const themeServiceMock = {
  currentTheme,

  getCurrentTheme: () => currentTheme(),

  setTheme: (theme: string) => currentTheme.set(theme),

  isDarkMode: () => currentTheme() === 'dark',

  toggleTheme: () => {
    currentTheme.set(
      currentTheme() === 'dark' ? 'light' : 'dark'
    );
  }
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        CommonModule,
        TranslatePipe,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: langServiceMock },
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});