import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if we are logged in (using the signal or localStorage directly)
  if (authService.currentUser() || localStorage.getItem('access_token')) {
    return true; // Come on in!
  }

  // Not logged in? Go to login page.
  return router.parseUrl('/login');
};