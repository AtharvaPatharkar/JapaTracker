import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { doc, getDoc } from '@angular/fire/firestore';

export const adminGuard: CanActivateFn = async () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.getCurrentUserAsync();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const snap = await getDoc(
    doc(auth['firestore'], `users/${user.uid}`)
  );

  const data = snap.data();

  if (data?.['role'] !== 'admin') {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};