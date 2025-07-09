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
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../Service/user-management.service';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For table in PDF
import autoTable from 'jspdf-autotable';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'manage-task',
  imports: [
    CommonModule,
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
  templateUrl: './manage-task.component.html',
  styleUrls: ['./manage-task.component.scss'],
})
export class ManageTaskComponent implements OnInit {
  onAssignUser(arg0: number, arg1: number) {
    throw new Error('Method not implemented.');
  }
  displayedColumns: string[] = [
    'title',
    'description',
    'priority',
    'deadline',
    'status',
    'branch',
    'requester',
    'assignee',
    'remark',
    'actions',
  ];
  dataSource: MatTableDataSource<Tasks> = new MatTableDataSource<Tasks>([]);
  tasks: Tasks[] = [];
  task:any;
  filteredTasks: any[] = []; //

  totalTasks: number = 0;
  faPen = faPen;
  faTrash = faTrash;
  faUserTag = faUserTag;
  faKey = faKey;
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
    private route: ActivatedRoute
  ) {}
  exportToExcel(): void {
    const filteredData = this.dataSource.filteredData;
    if (filteredData.length === 0) {
      alert('No data available to export!');
      return;
    }

    const dataForExport = filteredData.map((row: Tasks) => {
      const assignedUser: User | undefined = this.users.find(
        (user: User) => user.id === row.assignedUserId
      );
      const assignedUserName =
        assignedUser && assignedUser.username
          ? assignedUser.username.toLowerCase()
          : 'unassigned';

      return {
        Title: row.title,
        Description: row.description,
        Priority: row.priority,
        Status: row.status,
        Deadline: row.deadline,
        Assignee: assignedUserName,
      };
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Data');
    XLSX.writeFile(wb, 'Report.xlsx');
  }
  exportToPDF(): void {
    const filteredData = this.dataSource.filteredData; // Get only the filtered rows
    if (filteredData.length === 0) {
      alert('No data available to export!');
      return;
    }
    const dataForExport = filteredData.map((row) => {
      const assignedUser: User | undefined = this.users.find(
        (user: User) => user.id === row.assignedUserId
      );
      const assignedUserName =
        assignedUser && assignedUser.username
          ? assignedUser.username.toLowerCase()
          : 'unassigned';
      return {
        Title: row.title,
        Description: row.description,
        Priority: row.priority,
        Status: row.status,
        Deadline: row.deadline,
        Assignee: assignedUserName,
      };
    });
    const doc = new jsPDF();
    const imgData = '../../assets/report.png';
    const imgWidth = 150;
    const imgHeight = 50;
    const x = (doc.internal.pageSize.width - imgWidth) / 2;
    doc.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight);
    doc.text('Filtered Tasks Report', 10, 70);
    const tableBody = dataForExport.map((row) => [
      row.Title,
      row.Description,
      row.Priority,
      row.Status,
      row.Deadline,
      row.Assignee,
    ]);

    doc.autoTable({
      head: [
        ['Title', 'Description', 'Priority', 'Status', 'Deadline', 'Assignee'],
      ],
      body: tableBody,
      startY: 80,
    });

    doc.save('TaskReport.pdf');
  }
  exportToCSV(): void {
    const filteredData = this.dataSource.filteredData;
    if (filteredData.length === 0) {
      alert('No data available to export!');
      return;
    }
    const dataForExport = filteredData.map((row) => {
      const assignedUser: User | undefined = this.users.find(
        (user: User) => user.id === row.assignedUserId
      );
      const assignedUserName =
        assignedUser && assignedUser.username
          ? assignedUser.username.toLowerCase()
          : 'unassigned';
      return {
        Title: row.title,
        Description: row.description,
        Priority: row.priority,
        Status: row.status,
        Deadline: row.deadline,
        Assignee: assignedUserName,
      };
    });
    const headers = Object.keys(dataForExport[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    dataForExport.forEach((row) => {
      const values = headers.map((header) => {
        const value =
          row[header as keyof typeof row] !== undefined
            ? row[header as keyof typeof row]
            : '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSource.filterPredicate = (
      data: Tasks,
      filter: string
    ): boolean => {
      const assignedUser: User = this.users.find(
        (user: User) => user.id === data.assignedUserId
      );

      const assignedUserName =
        assignedUser && assignedUser.username
          ? assignedUser.username.toLowerCase()
          : 'Unassigned';

      const dataStr = (
        data.title +
        data.description +
        data.priority +
        data.status +
        data.deadline +
        assignedUserName
      ).toLowerCase();

      return dataStr.includes(filter);
    };

    this.dataSource.filter = filterValue;

    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.cdr.detectChanges();
    if (this.jwtToken) {
      this.loadTasks();
    } else {
      console.error('JWT token not found in localStorage.');
    }
    this.taskapiService.getEmployees().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.users = response.data;
          console.log('Employees Loaded:', this.users);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load employees. Please try again later.';
        this.loading = false;
      },
    });
    this.route.queryParams.subscribe((params) => {
      const filter = params['filter']; // Get filter parameter
      this.loadTasks(filter);
    });
    this.cdr.detectChanges();
  }
  loadTasks(filter?: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskapiService.getAllTasks().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (response && response.data) {
          let tasksData = response.data
            .filter(
              (task: any) =>
                task.status === 'Pending' ||
                task.status === 'Assigned' ||
                task.status === 'Completed'
            )
            .map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              deadline: task.deadline,
              creatorId: task.creatorId,
              assignedUserId: task.assignedUserId || 'Unassigned',
              requestorUsername: task.creator
                ? task.creator.username
                : 'Unknown',
                remark: task.remark ,
                 branchCode: task.branch.branchCode,
                branchName: task.branch.branchName ,
         
        
            }));
            
            if (filter === 'Completed') {
              tasksData = tasksData.filter((task: { status: string; }) => task.status === 'Completed');
            }
            if (filter === 'Pending') {
              tasksData = tasksData.filter((task: { status: string; }) => task.status === 'Pending');
            }

            if (filter === 'Assigned') {
              tasksData = tasksData.filter((task: { status: string; }) => task.status === 'Assigned');
            }

          this.dataSource = new MatTableDataSource<Tasks>(tasksData);
          this.totalTasks = tasksData.length;

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

  assignTask(task: Tasks): void {
    let assignedUserId: number | null = null;
    //const user = this.getLoggedInUserId();
    const managerId = parseInt(localStorage.getItem('id') || '0', 10);

    if (task.assignedUserId === 'Unassigned') {
      assignedUserId = null;
    } else if (typeof task.assignedUserId === 'string') {
      assignedUserId = +task.assignedUserId;
    } else {
      assignedUserId = task.assignedUserId;
    }
    if (assignedUserId !== null) {
      task.status = 'Assigned'; // Set the status to 'Assigned'
      this.taskapiService
        .assignTask(task.id, assignedUserId, managerId)
        .subscribe({
          next: (response: Task) => {
            console.log('Task assigned successfully:', response);
            this.loadTasks();
          },
          error: (error: any) => {
            this.errorMessage =
              'Failed to assign task. Please try again later.';
          },
        });
    } else {
      task.status = 'Pending';
      this.taskapiService.assignTask(task.id, null, null).subscribe({
        next: (response: Task) => {
          console.log('Task unassigned successfully:', response);
          this.loadTasks();
        },
        error: (error: any) => {
          this.errorMessage =
            'Failed to unassign task. Please try again later.';
        },
      });
    }
  }

  getLoggedInUserId(): number {
    const userId = localStorage.getItem('id');

    // If the ID exists, return it as a number, otherwise return a default value (e.g., -1 for an invalid user)
    return userId ? parseInt(userId, 10) : -1; // -1 is a placeholder for an invalid ID
  }
}
