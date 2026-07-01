import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';

describe('AuthService', () => {
  let service: AuthService;

  const authMock = {
    currentUser: null,

    setPersistence: () => Promise.resolve(),

    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },

    signOut: () => Promise.resolve(),

    signInWithEmailAndPassword: () => Promise.resolve(),

    createUserWithEmailAndPassword: () => Promise.resolve(),

    sendPasswordResetEmail: () => Promise.resolve()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authMock },
        { provide: Firestore, useValue: {} },
        { provide: Storage, useValue: {} }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});