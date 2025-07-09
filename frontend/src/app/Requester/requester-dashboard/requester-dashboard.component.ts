import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { taskapicalls } from '../../Service/task-management.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  faTasks,         // Total Tasks
  faCheckSquare,   // Completed Tasks
  faUserTag,     // Assigned Tasks
  faHourglassHalf,         // Pending Tasks
  faFileAlt,       // Draft Tasks
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'requester-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule,RouterLink,FontAwesomeModule],
  templateUrl: './requester-dashboard.component.html',
  styleUrl: './requester-dashboard.component.scss',
})
export class RequesterDashboardComponent {
  id = parseInt(localStorage.getItem('id') || '0', 10);


  faTasks =faTasks ;      // Total Tasks
  faCheckSquare=faCheckSquare;  // Completed Tasks
  faUserTag=faUserTag;    // Assigned Tasks
  faHourglassHalf=faHourglassHalf;        // Pending Tasks
  faFileAlt=faFileAlt;

  // Separate properties for task statuses
  completedTasks: number = 0;
  assignedTasks: number = 0;
  pendingTasks: number = 0;
  draftTasks: number = 0;

  totalTasksCreatedByRequester: number = 0;
  constructor(
    private taskapiService: taskapicalls,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployeeStats();
  }
  loadEmployeeStats(): void {
    this.taskapiService.getRequesterStat(this.id).subscribe({
      next: (data) => {
        const { taskStatusCounts, totalTasksCreatedByRequester } = data;
        this.completedTasks = taskStatusCounts?.Completed || 0;

        this.assignedTasks = taskStatusCounts?.Assigned || 0;
        this.pendingTasks = taskStatusCounts?.Pending || 0;
        this.draftTasks = taskStatusCounts?.Draft || 0;

        this.totalTasksCreatedByRequester = totalTasksCreatedByRequester || 0;
        this.cdr.detectChanges(); // Ensure the UI is updated
      },
      error: (err) => {
        console.error('Error fetching manager stats:', err);
      },
    });
  }
}
