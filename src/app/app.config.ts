import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// 🔥 Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // 🔥 Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
  
    provideAuth(() => {
      const auth = getAuth();
      setPersistence(auth, browserLocalPersistence);
      return auth;
    }),
    
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};