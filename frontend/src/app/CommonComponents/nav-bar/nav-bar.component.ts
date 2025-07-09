import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Route,
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faDashboard,
  faUser,
  faAdd,
  faUserCog,
  faUserPlus,
  faSignOutAlt,
  faKey,
  faUserEdit,
  faTasks,
  faPlus,
  faClipboardList,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  faDashboard = faDashboard;
  faUser = faUser;
  faAdd = faAdd;
  faUserCog = faUserCog; // Manage User
  faUserPlus = faUserPlus; // Add User
  faSignOutAlt = faSignOutAlt; // Logout
  faKey = faKey; // Change Password
  faUserCircle = faUserEdit;
  faTasks = faTasks;
  faPlus = faPlus;
  faClipboardList = faClipboardList;
  faBuilding = faBuilding;

  isAdmin: boolean = false;
  isManager: boolean = false;
  isEmployee: boolean = false;
  isRequester: boolean = false;

  constructor(private router: Router) {
    this.checkUserRole();
  }

  private checkUserRole(): void {
    const roles = JSON.parse(localStorage.getItem('role') || '[]');
    console.log('User roles:', roles); // Debugging: Check roles
    this.isAdmin = roles.includes('Admin'); // Set to true if the user is an Admin
    this.isManager = roles.includes('Manager');
    this.isEmployee = roles.includes('Employee');
    this.isRequester = roles.includes('Requester');

  }

  logout(): void {
    localStorage.removeItem('jwtToken'); // remove stored token or auth data
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    this.router.navigate(['/login']); // redirect to login page
  }
}
