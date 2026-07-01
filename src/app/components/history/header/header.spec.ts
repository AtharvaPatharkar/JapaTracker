import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryHeader } from './header';
import { AuthService } from '../../../services/auth';
import { LanguageService } from '../../../services/language';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { BehaviorSubject, of } from 'rxjs'; // 👈 हे महत्त्वाचे आहे

describe('HistoryHeader', () => {
  let component: HistoryHeader;
  let fixture: ComponentFixture<HistoryHeader>;

const authServiceMock = {

  isLoggedIn: () => true,

  getCurrentUser: () => ({
    uid: '123',
    name: 'Test User'
  }),

  getCurrentUserAsync: () =>
    Promise.resolve({
      uid: '123'
    }),

  getUserProfile: () =>
    Promise.resolve({
      name: 'Test User',
      photoURL: ''
    }),

  getMyJapaRealtime: () => of([]),

  // 🔥 IMPORTANT
  user$: of(null),

  japa$: of([]),

  history$: of([]),

  data$: new BehaviorSubject([])
};
  const langServiceMock = {
    getTranslate: (key: string) => 'Mock String',
    getCurrentLang: () => 'mr'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryHeader, TranslatePipe],
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