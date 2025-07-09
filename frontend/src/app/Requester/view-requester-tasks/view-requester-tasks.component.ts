import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  taskapicalls,
  Task,
  Tasks,
} from '../../Service/task-management.service';
import {
  faPen,
  faTrash,
  faUserTag,
  faKey,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule, DatePipe } from '@angular/common';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { User } from '../../Service/user-management.service';
import * as XLSX from 'xlsx'; // For Excel export

import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For table in PDF
import autoTable from 'jspdf-autotable';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'view-requester-tasks',
  imports: [

    CommonModule,
    MatCheckboxModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './view-requester-tasks.component.html',
  styleUrl: './view-requester-tasks.component.scss',
  providers: [DatePipe],
})
export class ViewRequesterTasksComponent implements OnInit {
  onAssignUser(arg0: number, arg1: number) {
    throw new Error('Method not implemented.');
  }
  allColumns: string[] = [
    'title',
    'description',
    'priority',
    'status',
    'deadline',
    'branch',
    'manager',
    'assignee',
    'remark',
    
  ];
  displayedColumns: string[] = ['title',
    'description',
    'priority',
    'status',
    'deadline','actions'
  ];
  
  dataSource: MatTableDataSource<Tasks> = new MatTableDataSource<Tasks>([]);
  tasks: Tasks[] = [];

  toggleColumnVisibility(column: string, event: any) {
    // Temporarily remove 'actions' column if it exists
    const actionsIndex = this.displayedColumns.indexOf('actions');
    if (actionsIndex > -1) {
      this.displayedColumns.splice(actionsIndex, 1);
    }
  
    // Add or remove the column based on the event
    if (event.checked) {
      this.displayedColumns.push(column);
    } else {
      const index = this.displayedColumns.indexOf(column);
      if (index > -1) {
        this.displayedColumns.splice(index, 1);
      }
    }
  
    // Always re-add 'actions' at the end
    if (!this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }
   
  }
  

  // Method to reset to default columns
  resetColumns() {
    this.displayedColumns = ['title', 'description', 'priority', 'status', 'deadline', 'actions'];
  }
  totalTasks: number = 0;
  faPen = faPen;
  faTrash = faTrash;
  faUserTag = faUserTag;
  faKey = faKey;
  faPaperPlane = faPaperPlane;
  loading = false;
  errorMessage: string | null = null;
  jwtToken: string | null = null;
  users: any;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  constructor(
    private taskapiService: taskapicalls,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private datePipe: DatePipe, // Inject DatePipe
    private route:ActivatedRoute
  ) {}
  exportToExcel(): void {
    // Get the filtered tasks data from MatTableDataSource
    const filteredData = this.dataSource.filteredData;
  
    if (filteredData.length === 0) {
      alert('No tasks available to export!');
      return;
    }
  
    // Prepare data for export from filtered data, only including visible columns
    const visibleColumns = this.displayedColumns.filter((col) => this.isColumnVisible(col));
  
    const dataForExport = filteredData.map((task: any) => {
      const taskData: any = {};
      visibleColumns.forEach((col) => {
        taskData[col] = task[col];
      });
      return taskData;
    });
  
    // Create a new workbook and add the filtered data as a sheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks Report');
  
    // Save the workbook as an Excel file
    XLSX.writeFile(wb, 'Tasks_Report.xlsx');
  }

  isColumnVisible(column: string): boolean {
    return true; 
  }
  
  exportToPDF(): void {
    // Get the filtered tasks data from MatTableDataSource
    const filteredData = this.dataSource.filteredData;
  
    if (filteredData.length === 0) {
      alert('No tasks available to export!');
      return;
    }
    const visibleColumns = this.displayedColumns.filter((col) => this.isColumnVisible(col) && col !== 'actions');
    const dataForExport = filteredData.map((task: any) => {
      return visibleColumns.map((col) => {
       
        if (col==='title' ) {
          return  task[col] = task.title;
        }
        if (col==='description') {
          return  task[col] =  task.description
        }
        if (col==='priority' ) {
          return  task[col] = task.priority;
        }
        if (col==='status') {
          return  task[col] = task.status;
        }
        if (col==='deadline' ) {
          return  task[col] = task.deadline;
        }
        if (col==='remark' ) {
          return  task[col] = task.remark;
        }

        if (col === 'assignee' ) {
          return  task[col] = task.assigneeUsername;
        } else if (col === 'branch' ) {
          return `${task.branchCode} - ${task.branchName}`;
        } else if (col === 'manager' ) {
          return  task[col] = task.managerUsername;
        } 
            
      });
    });


    
  
    console.log('Filtered Data for Export:', dataForExport);
  
    // Generate PDF
    const doc = new jsPDF();
    const imgData = '../../../assets/report.png';
    const imgWidth = 150;
    const imgHeight = 50;
    const x = (doc.internal.pageSize.width - imgWidth) / 2;
  
    doc.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight);
    doc.text('Tasks Report', 10, 70);
  
    doc.autoTable({
      head: [
   visibleColumns
        ],
      body: dataForExport,
      startY: 80,
    });
  
    doc.save('Tasks_Report.pdf');
  }
  

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.cdr.detectChanges();
    if (this.jwtToken) {
      this.route.queryParams.subscribe((params) => {
        const filter = params['filter']; // Capture 'filter' query parameter
        this.loadTasks(filter);
      });
    } else {
      console.error('JWT token not found in localStorage.');
    }
    
    this.cdr.detectChanges();
  }
  loadTasks(filter?:string ): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskapiService.getAllTasksRequestor().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (response && response.data) {
          const loggedInUserId = this.getLoggedInUserId();
          // Map and filter the tasks based on the logged-in user
          let tasksData = response.data
            .map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              deadline: task.deadline,
              creatorId: task.creatorId,
              assignedUserId: task.assignedUserId || 'Unassigned', // Default to 'Unassigned'
              assigneeUsername: task.assignee
                ? task.assignee.username
                : 'Unassigned', // Default to 'Unassigned'
              managerid: task.managerid,
              managerUsername: task.manager ? task.manager.username : 'Unassigned', // Default to 'Unassigned'
              remark: task.remark , // Default to 'not provided'
              branchCode: task.branch.branchCode,
          branchName: task.branch.branchName,
            }))

            .filter((task: any) => task.creatorId === loggedInUserId);

            if (filter) {
              tasksData = tasksData.filter((task: any) => task.status === filter);
            }
          console.log('Tasks Data:', tasksData);
          // Bind the tasks data to the Material Table DataSource
          this.dataSource = new MatTableDataSource<Tasks>(tasksData);
          this.totalTasks = tasksData.length;
          // Attach the paginator and sort to the Material Table DataSource
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          console.log('Tasks Loaded into Material Table:', tasksData);
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks. Please try again later.';
        console.error('Load Tasks Error:', error);
        this.loading = false;
      },
    });
  }



  sendTask(task: Tasks) {
    this.loading = true;
    this.errorMessage = '';

    const updatedTaskData: Tasks = {
      ...task,
      deadline: this.datePipe.transform(task.deadline, 'dd-MM-yyyy') || '',
      status: 'Pending', // Explicitly include the original status
    };
    this.taskapiService.editTaskRequest(task.id, updatedTaskData).subscribe({
      next: (response: any) => {
        console.log('Task updated successfully:', response);
        this.loadTasks(); // Reload tasks after creating a new task
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to create task. Please try again later.';
        console.error('making the task Pending Error:', error);
        this.loading = false;
      },
    });
  }

  editTask(task: any) {
    const dialogRef = this.dialog.open(EditTaskComponent, {
      width: '400px',
      data: { task: { ...task } },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.tasks.findIndex((u) => u.id === result.id);
        if (index !== -1) {
          this.tasks[index] = result;
        }
      }
      this.cdr.detectChanges();
      //window.location.reload();
      this.loadTasks();
    });
  }
  getLoggedInUserId(): number {
    const userId = localStorage.getItem('id');

    // If the ID exists, return it as a number, otherwise return a default value (e.g., -1 for an invalid user)
    return userId ? parseInt(userId, 10) : -1; // -1 is a placeholder for an invalid ID
  }

  deleteTask(taskId: number): void {
    // Display confirmation dialog
    const userConfirmed = window.confirm('Are you sure you want to delete this task?');
  
    if (userConfirmed) {
      this.loading = true;
      this.errorMessage = '';
  
      this.taskapiService.deleteTask(taskId).subscribe({
        next: () => {
          console.log('Task deleted successfully');
          this.loadTasks(); // Reload tasks after deletion
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete task. Please try again later.';
          console.error('Delete task error:', error);
        },
      });
    }
  }
  
}
