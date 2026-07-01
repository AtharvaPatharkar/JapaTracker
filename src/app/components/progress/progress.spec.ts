import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressComponent } from './progress';
import { LanguageService } from '../../services/language';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { CommonModule } from '@angular/common';

describe('ProgressComponent', () => {
  let component: ProgressComponent;
  let fixture: ComponentFixture<ProgressComponent>;

  const langServiceMock = {
    getTranslate: (key: string) => 'Mock String',
    getCurrentLang: () => 'mr'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressComponent, CommonModule, TranslatePipe],
      providers: [
        { provide: LanguageService, useValue: langServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});