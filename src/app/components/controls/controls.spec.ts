import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlsComponent } from './controls';
import { AuthService } from '../../services/auth';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { LanguageService } from '../../services/language';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;

  const authServiceMock = {
    isLoggedIn: () => true,
    isGuestMode: () => false
  };

  const langServiceMock = {
    getTranslate: (key: string) => 'Mock String',
    getCurrentLang: () => 'mr'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsComponent, TranslatePipe],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: langServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});