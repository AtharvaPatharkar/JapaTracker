import { Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProfileComponent } from './components/profile/profile';
import { HistoryComponent } from './components/history/history';

// 🔥 Guards
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [

  // =========================
  // 🔁 DEFAULT
  // =========================
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // =========================
  // 🔓 PUBLIC
  // =========================
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // =========================
  // 🟡 GUEST ALLOWED (no save warning handled in UI)
  // =========================
  { path: 'dashboard', component: Dashboard },

  // =========================
  // 🔒 AUTH REQUIRED
  // =========================
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [authGuard]
  },

  // =========================
  // 👑 ADMIN ONLY
  // =========================
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },

  // =========================
  // ❌ FALLBACK
  // =========================
  { path: '**', redirectTo: 'dashboard' }

];