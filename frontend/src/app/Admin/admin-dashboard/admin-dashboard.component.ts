import { Component, OnInit } from '@angular/core';
import { ApicallsService } from '../../Service/user-management.service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import {
  faUsers,        // Total Users
  faUserTag,      // Total Roles
  faUserShield,   // Admin
  faUserTie,      // Manager
  faUserCircle,   // Employee
  faUserAlt,      // Requester
  faBan,          // No roles (representing 'No Access' or 'Blocked')
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule,RouterLink,FontAwesomeModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {

    faUsers=faUsers;       // Total Users
    faUserTag=faUserTag   // Total Roles
    faUserShield=faUserShield   // Admin
    faUserTie=faUserTie     // Manager
    faUserCircle=faUserCircle   // Employee
    faUserAlt=faUserAlt      // Requester
    faBan=faBan          // No roles (representing 'No Access' or 'Blocked')

  totalUsers: number = 0;
  totalRoles: number = 0;

  totalAdmin: number = 0;
  totalManager: number = 0;
  totalEmployee: number = 0;
  totalRequester: number = 0;
  usersWithNoRole:number=0

  constructor(
    private apiCallsService: ApicallsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getDashboardStats();
  }

  getDashboardStats(): void {
    this.apiCallsService.getStats().subscribe(
      (data) => {
        // Extract totalUsers and totalRoles directly from the response
        this.totalUsers = data.totalUsers;
        this.totalRoles = data.totalRoles;
        this.usersWithNoRole=data.usersWithNoRole;

        // Map the usersPerRole data to individual roles
        const usersPerRole: any = data.usersPerRole;
        this.totalAdmin = usersPerRole['Admin'] || 0;
        this.totalManager = usersPerRole['Manager'] || 0;
        this.totalEmployee = usersPerRole['Employee'] || 0;
        this.totalRequester = usersPerRole['Requester'] || 0;


        // Log the data for debugging
        console.log('Total Users:', this.totalUsers);
        console.log('Total Roles:', this.totalRoles);
        console.log('Users per Role:', usersPerRole);

        // Trigger change detection to ensure UI is updated
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching dashboard stats:', error);
      }
    );
  }
}
