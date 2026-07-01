import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  // Mock Services
  const authServiceMock = {
    register: () => Promise.resolve(true),
    saveJapa: () => Promise.resolve(),
    setGuestMode: () => {},
    isLoggedIn: () => false 
  };

  const languageServiceMock = {
    getTranslate: (key: string) => 'Mock String'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent, 
        FormsModule, 
        CommonModule, 
        FooterComponent, 
        TranslatePipe,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]), 
        { provide: AuthService, useValue: authServiceMock },
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isSaving).toBe(false);
    expect(component.loading).toBe(false);
  });
});