import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  Task,
  taskapicalls,
  Tasks,
} from '../../Service/task-management.service';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'viewtasks',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './viewtasks.component.html',
  styleUrl: './viewtasks.component.scss',
  providers: [DatePipe],
})
export class ViewtasksComponent implements OnInit {
  taskComplete!: FormGroup;
  successMessage: string = '';
  jwtToken: string | null = null;
  errorMessage: string = '';
  loading = false;
  task: Tasks[] = [];
  tasks: any[] = [];
  users: any;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private taskapiService: taskapicalls,
    private datePipe: DatePipe,
        private route: ActivatedRoute
  ) {
    this.taskComplete = this.fb.group({
      remark: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.jwtToken = localStorage.getItem('jwtToken');
    this.cdr.detectChanges();
    if (this.jwtToken) {
      this.route.queryParams.subscribe((params) => {
        const filter = params['filter']; // Get filter parameter
        this.loadTasks(filter);
      });
     
    } else {
      console.error('JWT token not found in localStorage.');
    }
  }
  loadTasks(filter?: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.taskapiService.getAllTasks().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (response && response.data) {
          const loggedInUserId = this.getLoggedInUserId();
          const currentDate = new Date();
          
          this.tasks = response.data
            .map((task: any) => {
              const deadlineDate = new Date(task.deadline);
            const isExpired = deadlineDate < currentDate;

            const timeDiff = deadlineDate.getTime() - currentDate.getTime();
            const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
              return {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                deadline: task.deadline,
                creatorUsername: task.creator?.username || 'Unknown', // Directly access creator.username
                assignedUserId: task.assignedUserId || 'Unassigned',
                managerid: task.managerid,
                managerUsername: task.manager?.username || 'Unknown',
                remark: task.remark,
                branchCode: task.branch.branchCode,
                branchName: task.branch.branchName ,
                isExpired,
                daysRemaining,
              };
            })
            .filter((task: any) => {
              // Check if the task matches the logged-in user and the filter (if provided)
              const matchesUser = task.assignedUserId === loggedInUserId;
              const matchesFilter = !filter || task.status === filter;
              return matchesUser && matchesFilter;
            })
            .sort((a: any, b: any) => {
              // Sort completed tasks to the bottom
              if (a.status === 'Completed' && b.status !== 'Completed') {
                return 1;
              } else if (a.status !== 'Completed' && b.status === 'Completed') {
                return -1;
              }
              if (a.isExpired && !b.isExpired) {
                return -1; // Expired task comes first
              } else if (!a.isExpired && b.isExpired) {
                return 1; // Non-expired task goes below
              }
              return 0; // Leave the order of other tasks unchanged
            });
          console.log('Tasks Loaded:', this.tasks);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks. Please try again later.';
        this.loading = false;
      },
    });
  }
  getLoggedInUserId(): number {
    const userId = localStorage.getItem('id');
    // If the ID exists, return it as a number, otherwise return a default value (e.g., -1 for an invalid user)
    return userId ? parseInt(userId, 10) : -1; // -1 is a placeholder for an invalid ID
  }

  updateTaskStatus(task: Tasks): void {
    if (this.taskComplete.invalid) {
      Object.keys(this.taskComplete.controls).forEach((control) => {
        const controlObj = this.taskComplete.get(control);
        if (controlObj?.invalid) {
          if (controlObj.hasError('required')) {
            this.errorMessage = `${control} can not be empty! .`;
          }
        }
      });
      return;
    }
    const newStatus = task.status === 'Assigned' ? 'Completed' : 'Assigned';

    const formattedDeadline = this.datePipe.transform(
      task.deadline,
      'dd-MM-yyyy'
    );

    // Call API to update the task status
    const updatedTaskData = {
      ...task,
      deadline: formattedDeadline,
      status: newStatus,
      remark: this.taskComplete.value.remark,
    };

    this.taskapiService.editTask(task.id, updatedTaskData).subscribe({
      next: (response) => {
        
        console.log('Task status updated successfully:', response);
        task.status = newStatus; // Update the local task status
        task.remark = this.taskComplete.value.remark;
       
        task.deadline = formattedDeadline;
        this.taskComplete.reset();
        this.cdr.detectChanges();
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.errorMessage =
          error.error?.message || 'Failed to update task status.';
        this.cdr.detectChanges();
      },
    });
    this.cdr.detectChanges();
  }
  editTask(task: Tasks): void {
    if (task.status !== 'Completed') {
      // Update the form value to reflect the current task's remark
      this.taskComplete.get('remark')?.setValue(task.remark || '');
    }
  }
}
