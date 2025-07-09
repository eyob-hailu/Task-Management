import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';

export const roleGuard: CanActivateFn = (route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const location = inject(Location);

  // Get user roles from localStorage (you can modify this to retrieve roles from an API or token if needed)
  const roles = JSON.parse(localStorage.getItem('role') || '[]');
  const requiredRoles = route.data['roles'] as Array<string>; // Roles required for this route

  // Check if user has at least one required role
  const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));

  if (!hasRequiredRole) {
    window.alert(
      'Access Denied: You do not have permission to view this page.'
    );
    location.back();
    return false;
  }

  //Allow access if the user has the required role
  return true;
};
