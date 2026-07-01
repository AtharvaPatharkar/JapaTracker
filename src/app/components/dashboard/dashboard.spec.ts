import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { AuthService } from '../../services/auth';
import { JapaStateService } from '../../services/japa-state';
import { LanguageService } from '../../services/language';
import { SoundService } from '../../services/sound';
import { ThemeService } from '../../services/theme';
import { provideRouter } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { Subject, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  const authServiceMock = {
    authState$: new Subject<any>(),

    isLoggedIn: () => true,

    isGuestMode: () => false,

    currentUser: () =>
      of({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com'
      }),

    userProfile: () =>
      of({
        uid: '123',
        displayName: 'Test User',
        name: 'Test User',
        photoURL: '',
        email: 'test@example.com'
      }),

    getCurrentUserAsync: () =>
      Promise.resolve({
        uid: '123',
        name: 'Test User',
        email: 'test@example.com'
      }),

    getUserProfile: () =>
      Promise.resolve({
        name: 'Test User',
        photoURL: ''
      }),

    logout: vi.fn(() => Promise.resolve()),

    setGuestMode: vi.fn()
  };

  const japaStateMock = {
    count: 0,
    mala: 0,
    target: 108,
    isLimitReached: false,
    isRunning: false,

    japaUpdated: new Subject<void>(),

    loadState: vi.fn(),
    saveState: vi.fn(),
    stopAutoclick: vi.fn(),
    resetToDefault: vi.fn()
  };

  const langServiceMock = {
    getTranslate: (key: string) => key,
    getCurrentLang: () => 'mr',
    selectedLang$: new Subject<string>()
  };

  const soundServiceMock = {
    requestWakeLock: vi.fn(),
    releaseWakeLock: vi.fn()
  };

  const themeServiceMock = {
    isDarkMode: false,
    toggleTheme: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        TranslatePipe,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([
          { path: 'login', component: class {} }
        ]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: JapaStateService, useValue: japaStateMock },
        { provide: LanguageService, useValue: langServiceMock },
        { provide: SoundService, useValue: soundServiceMock },
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct default greeting key', () => {
    const greeting = component.getGreetingKey();
    expect(['morning', 'afternoon', 'evening']).toContain(greeting);
  });

  it('should toggle battery saver status', () => {
    const initialStatus = component.isBatterySaver;
    component.toggleBatterySaver();
    expect(component.isBatterySaver).toBe(!initialStatus);
  });

  it('should call auth logout and navigate on logout()', async () => {
    await component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});