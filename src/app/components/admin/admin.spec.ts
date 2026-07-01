import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin';
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { provideRouter } from '@angular/router';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  const authServiceMock = {
    isLoggedIn: () => true,

    isAdmin: () => Promise.resolve(true),

    getCurrentUserAsync: () =>
      Promise.resolve({ name: 'Admin' }),

    getAllUsersRealtime: (callback: any) => {
      callback([]);
      return () => {}; // ✅ unsubscribe mock
    },

    getUserProfile: () =>
      Promise.resolve({ name: 'Admin' }),

    adminDeleteUser: () => Promise.resolve()
  };

  const langServiceMock = {
    getTranslate: (key: string) => 'Mock String',
    getCurrentLang: () => 'mr'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminComponent,
        TranslatePipe
      ],
      providers: [
        provideRouter([]),

        {
          provide: AuthService,
          useValue: authServiceMock
        },

        {
          provide: LanguageService,
          useValue: langServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    // ✅ async ngOnInit complete होण्यासाठी
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users', () => {
    expect(component.users).toEqual([]);
    expect(component.loading).toBe(false);
  });

  it('should calculate total pages', () => {
    component.users = Array(12).fill({
      createdAt: new Date().toISOString()
    });

    component.pageSize = 5;

    expect(component.totalPages).toBe(3);
  });

  it('should go to next page', () => {
    component.users = Array(12).fill({
      createdAt: new Date().toISOString()
    });

    component.pageSize = 5;
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should go to previous page', () => {
    component.currentPage = 2;

    component.prevPage();

    expect(component.currentPage).toBe(1);
  });
});