import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { taskapicalls } from '../../Service/task-management.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTasks,        // Total Tasks
  faCheckSquare,  // Completed Tasks
  faTimesSquare,  // Incomplete Tasks
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'employee-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule,RouterLink,FontAwesomeModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
})
export class EmployeeDashboardComponent implements OnInit {

  faTasks=faTasks;        // Total Tasks
  faCheckSquare=faCheckSquare;  // Completed Tasks
  faTimesSquare=faTimesSquare;  // Incomplete Tasks


  id = parseInt(localStorage.getItem('id') || '0', 10);

  // Separate properties for task statuses
  completedTasks: number = 0;
  unassignedTasks: number = 0;
  incompletetasks: number = 0;


  totalTasksAssigned: number = 0;
  constructor(
    private taskapiService: taskapicalls,
    private cdr: ChangeDetectorRef
    
  ) {}

  ngOnInit(): void {
    this.loadEmployeeStats();
  }
  loadEmployeeStats(): void {
    this.taskapiService.getEmployeeStats(this.id).subscribe({
      next: (data) => {
        const { taskStatusCounts, totalTasksAssigned } = data;
        this.completedTasks = taskStatusCounts?.Completed || 0;


        this.incompletetasks = taskStatusCounts?.Assigned || 0;

        this.totalTasksAssigned = totalTasksAssigned || 0;
        this.cdr.detectChanges(); // Ensure the UI is updated
      },
      error: (err) => {
        console.error('Error fetching manager stats:', err);
      },
    });
  }
}
