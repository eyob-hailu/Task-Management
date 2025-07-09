import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

// Using a function instead of a class-based guard
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService); // Get AuthService instance using inject()
  const router = inject(Router); // Get Router instance using inject()

  const token = localStorage.getItem('jwtToken');
  if (token && !authService.isTokenExpired()) {
    return true;
  }
  if (authService.isAuthenticated()) {
    return true;
  } else {
    localStorage.removeItem('jwtToken');
    router.navigate(['/login']);
    return false;
  }
};

// This guard is for preventing logged-in users from accessing the login page
export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('jwtToken');
  if (token) {
    // Get the user role from localStorage and parse it
    const userRole = JSON.parse(localStorage.getItem('role') || '[]')[0]; // Access the first element of the array
  
    // Redirect based on the user role
    if (userRole === 'Admin') {
      router.navigate(['/admin/dashboard']);
    } else if (userRole === 'Manager') {
      router.navigate(['/manager/manager-dashboard']);
    } else if (userRole === 'Employee') {
      router.navigate(['/employee/employee-dashboard']);
    } else if (userRole === 'Requester') {
      router.navigate(['/requester/requester-dashboard']);
    }

    return false;  // Prevent access to the login page
}
  
  // Otherwise, allow access to the login page
  return true;
};
