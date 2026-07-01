import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history';
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { HistoryHeader } from './header/header';
import { CommonModule } from '@angular/common';

describe('HistoryHeader', () => {
  let component: HistoryHeader;
  let fixture: ComponentFixture<HistoryHeader>;

const authServiceMock = {
  isLoggedIn: () => true,
  getCurrentUser: () => ({ uid: '123', name: 'User' }),
  getCurrentUserAsync: () => Promise.resolve({ uid: '123', name: 'User' }),
  getUserProfile: () => Promise.resolve({ name: 'User', photoURL: '' }),
  getDailyQuests: () => Promise.resolve([]),
  getMyJapaRealtime: () => of([]), 
  getJapaHistory: () => Promise.resolve([])
};

  // २. LanguageService Mock
  const langServiceMock = {
    getTranslate: (key: string) => 'Mock String',
    getCurrentLang: () => 'mr'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryHeader, TranslatePipe, CommonModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: langServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryHeader);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});