import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const authServiceMock = {
    authState$: new Subject<any>(),

    isLoggedIn: () => true,

    isGuestMode: () => false,

    currentUser: () =>
      of({
        uid: '123',
        displayName: 'User',
        email: 'test@example.com'
      }),

    userProfile: () =>
      of({
        uid: '123',
        displayName: 'User',
        name: 'User',
        email: 'test@example.com',
        photoURL: ''
      }),

    loadingProfile: () => of(false),

    getCurrentUserAsync: () =>
      Promise.resolve({
        uid: '123',
        name: 'User'
      }),

    getUserProfile: () =>
      Promise.resolve({
        uid: '123',
        name: 'User',
        photoURL: ''
      }),

    login: vi.fn(() => Promise.resolve()),

    logout: vi.fn(() => Promise.resolve()),

    setGuestMode: vi.fn()
  };

  const langServiceMock = {
    getTranslate: (key: string) => key,
    getCurrentLang: () => 'mr',
    selectedLang$: new Subject<string>()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule,
        CommonModule,
        TranslatePipe
      ],
      providers: [
        provideRouter([
          { path: 'dashboard', component: class {} },
          { path: 'login', component: class {} }
        ]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: langServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});