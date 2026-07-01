import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyQuests } from './daily-quests';
import { AuthService } from '../../../services/auth';
import { LanguageService } from '../../../services/language';
import { TranslatePipe } from '../../../pipes/translate-pipe';

describe('DailyQuests', () => {
  let component: DailyQuests;
  let fixture: ComponentFixture<DailyQuests>;

const authServiceMock = {
  getDailyQuests: () => Promise.resolve([]),
  getCurrentUser: () => ({ uid: '123', name: 'User' })
};

  const langServiceMock = {
    getTranslate: (key: string) => 'Mock String',
    getCurrentLang: () => 'mr'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyQuests, TranslatePipe],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: langServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyQuests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});