import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { taskapicalls } from '../../Service/task-management.service';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faTasks, // Total Tasks
  faCheckSquare,   // Completed Tasks
  faHourglassHalf, // Pending Tasks
  faUserTag,       // Assigned Tasks
} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'manager-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule,RouterLink,FontAwesomeModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
})
export class ManagerDashboardComponent implements OnInit {

  faTasks = faTasks;
  faCheckSquare = faCheckSquare;
  faHourglassHalf = faHourglassHalf;
  faUserTag = faUserTag;
  id = parseInt(localStorage.getItem('id') || '0', 10);

  // Separate properties for task statuses
  completedTasks: number = 0;
  assignedTasks: number = 0;
  pendingTasks: number = 0;

  totalTask: number = 0;

  constructor(
    private taskapiService: taskapicalls,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.loadStats();
  }
  loadStats(): void {
    this.taskapiService.getManagerStat(this.id).subscribe({
      next: (data) => {
        // Map the API response to individual properties
        const { totalTasks, taskStatusCounts } = data;
        this.completedTasks = taskStatusCounts?.Completed || 0;
        this.assignedTasks = taskStatusCounts?.Assigned || 0;
        this.pendingTasks = taskStatusCounts?.Pending || 0;

        console.log('Manager stats:', data);

        this.totalTask = totalTasks || 0;
        this.cdr.detectChanges(); // Ensure the UI is updated
      },
      error: (err) => {
        console.error('Error fetching manager stats:', err);
      },
    });
  }
}
