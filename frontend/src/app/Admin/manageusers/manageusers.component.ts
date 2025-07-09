import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ApicallsService, User, Branch } from '../../Service/user-management.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { AssignRoleComponent } from '../assignrole/assignrole.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPen,
  faTrash,
  faUserTag,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For table in PDF
import autoTable from 'jspdf-autotable';
import {
  ActivatedRoute,
  Route,
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';




@Component({
  selector: 'manageusers',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FontAwesomeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    RouterModule,
  ],
  templateUrl: './manageusers.component.html',
  styleUrl: './manageusers.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageusersComponent implements OnInit, OnChanges {
  displayedColumns: string[] = [
    'firstname',
    'middlename',
    'lastname',
    'phonenumber',
    'email',
    'username',
    'office_type',
    'branch',
    'roles',
    'actions',
  ];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  faPen = faPen;
  faTrash = faTrash;
  faUserTag = faUserTag;
  faKey = faKey;

  users: User[] = [];
  jwtToken: string | null = null;
  errorMessage: string|null=null;
  successMessage: string|null=null;



  isLoading = signal(false);
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  faPlus: any;

  constructor(
    private apiService: ApicallsService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }
  file: File | null = null;

  bulkUpload(): void {
    if (this.file) {
      this.apiService.bulkUploadUsers(this.file).subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
          this.errorMessage="";
          this.successMessage="succesfully uploaded";
          
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        this.errorMessage="Error on the excel file";
        this.successMessage="";
        },
        complete: () => {
          
          console.log('File upload process completed.');
      //    this.cdr.detectChanges();
      this.loadUsers();
        }
      });
      //this.cdr.detectChanges();
      this.loadUsers();

    }
  }
  exportToExcel(): void {
    const filteredData = this.dataSource.filteredData; // Get only the filtered rows
    if (filteredData.length === 0) {
      alert('No data available to export!');
      return;
    }
    const dataForExport = filteredData.map((row) => ({
      'First Name': row.firstname,
      'Middle Name': row.middlename,
      'Last Name': row.lastname,
      'Phone Number': row.phonenumber,
      'office_type': row.officetype,
      'Branch' :row.branch ? `${row.branch.branchCode} - ${row.branch.branchName}` : '',
      Username: row.username,
      Roles: this.getRoles(row),
    }));
    // Convert JSON to sheet and export
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
    // Prepare data for PDF
    const dataForExport = filteredData.map((row) => [
      row.firstname,
      row.middlename,
      row.lastname,
      row.phonenumber,
      row.username,
      row.officetype,
      row.branch ? row.branch.branchCode + ' - ' +  row.branch.branchName : ' none',
      this.getRoles(row),
    ]);
    console.log(dataForExport)
    // Create PDF and add table
    const doc = new jsPDF();
    // const imgData = '../../assets/report.png';
    const imgData = '../../../assets/report.png';

    const imgWidth = 150;
    const imgHeight = 50;

    // Calculate the x position to center the image
    const x = (doc.internal.pageSize.width - imgWidth) / 2;

    // Add the image to the PDF, positioning it in the center horizontally
    doc.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight);
    //doc.addImage(imgData, 'PNG', 10, 10, 150, 50);
    doc.text('Filtered Users Report', 10, 70);
    doc.autoTable({
      head: [
        [
          'First Name',
          'Middle Name',
          'Last Name',
          'Phone Number',
          'Username',
          'officetype',
          'Branch',
          'Roles',
        ],
      ],
      body: dataForExport,
      startY: 80, // Ensure the table starts after the image and title
    });
    doc.save('Report.pdf');
  }

  // Export to CSV
  exportToCSV(): void {
    const filteredData = this.dataSource.filteredData; // Get only the filtered rows
    if (filteredData.length === 0) {
      alert('No data available to export!');
      return;
    }

    // Prepare CSV content
    const csvContent =
      'First Name,Middle Name,Last Name,Phone Number,Username,Roles\n' +
      filteredData
        .map(
          (row) =>
            `${row.firstname},${row.middlename},${row.lastname},${
              row.phonenumber
            },${row.username},"${this.getRoles(row)}"`
        )
        .join('\n');

    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(EditUserComponent, {
      width: '400px',
      data: { user: { ...user } },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.users.findIndex(
          (u) => u.username === result.username
        );
        if (index !== -1) {
          this.users[index] = result;
        }
      }
      this.cdr.detectChanges();
      //window.location.reload();
      this.loadUsers();
    });
  }
  ngOnInit(): void {
    this.jwtToken = localStorage.getItem('jwtToken');
    console.log('Retrieved token from localStorage:', this.jwtToken);
    if (this.jwtToken) {
      this.route.queryParams.subscribe((params) => {
        const filter = params['filter']; // Capture 'filter' query parameter
        this.loadUsers(filter);
      });
    } else {
      console.error('JWT token not found in localStorage.');
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.loadUsers();
    this.cdr.detectChanges();
  }
  loadUsers(filter?: string): void {
    this.isLoading.set(true);
    if (!this.jwtToken) return;

    this.apiService.getUsers().subscribe({
      next: (data) => {
        console.log('Fetched users:', data);
        let filteredData = data;

        // Example: Filter users by role 'Manager' if filter is 'manager'
        if (filter) {
          filteredData = data.filter((user) => user.roles.some((role:any) => role.role === filter));
        }
        if (filter === 'No roles') {
          filteredData = data.filter((user) => !user.roles || user.roles.length === 0);
        }      
  
        this.users = filteredData;
        this.dataSource.data = filteredData;
        this.isLoading.set(false);
        this.cdr.detectChanges();
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }
  pageChanged(event: any): void {}
  resetPassword(user: User): void {
    const confirmReset = confirm(
      `Are you sure you want to reset the password for ${user.firstname} ${user.lastname}?`
    );

    if (confirmReset) {
      const updatedUser = { ...user, password: '1234' };
      this.apiService.editUser(user.id, updatedUser).subscribe({
        next: () => {
          console.log(`Password for user ${user.id} has been reset to 1234.`);
          alert(
            `Password reset successfully for ${user.firstname} ${user.lastname}.`
          );
        },
        error: (err) => {
          console.error('Error resetting password:', err);
          alert('Failed to reset password. Please try again.');
        },
      });
    }
  }
  deleteUser(user: User): void {
    console.log(user);
    this.isLoading.set(false);
    if (!this.jwtToken) return;

    console.log(this.jwtToken);

    const confirmDelete = confirm(
      `Are you sure you want to delete ${user.firstname} ${user.lastname}?`
    );
    if (confirmDelete) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          console.log(`User ${user.id} deleted successfully.`);
          this.users = this.users.filter((u) => u.id !== user.id);
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        },
      });
    }
    this.cdr.detectChanges();
    // this.loadUsers();
  }
  getRoles(user: User): string {
    return user.roles && user.roles.length
      ? user.roles.map((role) => role.role).join(', ')
      : 'No roles';
  }
  sortRoles(event: any): void {
    const sortDirection = event.direction; // "asc" or "desc"
    if (sortDirection) {
      this.dataSource.data.sort((a, b) => {
        const rolesA = this.getRoles(a).toLowerCase();
        const rolesB = this.getRoles(b).toLowerCase();

        if (rolesA < rolesB) {
          return sortDirection === 'asc' ? -1 : 1;
        } else if (rolesA > rolesB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    // Apply the sorted data to the dataSource to trigger the table update
    this.dataSource.data = [...this.dataSource.data];
  }
  assignRole(user: User): void {
    const dialogRef = this.dialog.open(AssignRoleComponent, {
      width: '400px',
      data: { user, assignedRoles: user.roles },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Modal closed with result:', result);
      }
    });
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
  
    this.dataSource.filterPredicate = (data: User, filter: string): boolean => {

      const branchStr = data.branch
      ? `${data.branch.branchCode || ''} ${data.branch.branchName || ''}`.toLowerCase()
      : '';
 
  
      const dataStr = (
        data.firstname +
        data.middlename +
        data.lastname +
        data.phonenumber +
        data.username +
        data.officetype +
        (data.branch 
          ? (data.branch.branchCode ? data.branch.branchCode : '') + ' ' + 
            (data.branch.branchName ? data.branch.branchName : '') 
          : 'none')  +
        this.getRoles(data)
      ).toLowerCase();

      console.log(data.branch);
  
      return dataStr.indexOf(filter) !== -1;
    };
  
    this.dataSource.filter = filterValue;
  
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }
}
