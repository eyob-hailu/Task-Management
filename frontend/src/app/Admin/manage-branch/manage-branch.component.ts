import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ApicallsService, Branch } from '../../Service/user-management.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCellDef } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import {
  faKey,
  faPen,
  faTrash,
  faUserTag,
} from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { EditBranchComponent } from '../edit-branch/edit-branch.component';
import { AddBranchComponent } from '../add-branch/add-branch.component';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For table in PDF
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'manage-branch',
  standalone: true,
  imports: [
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
    CommonModule,
  ],
  templateUrl: './manage-branch.component.html',
  styleUrl: './manage-branch.component.scss',
})
export class ManageBranchComponent implements OnInit {
  displayedColumns: string[] = [
    'branchCode',
    'branchName',
    'branchAddress',
    'actions',
  ];

  dataSource: MatTableDataSource<Branch> = new MatTableDataSource<Branch>([]);
  faPen = faPen;
  faTrash = faTrash;
  faUserTag = faUserTag;
  faKey = faKey;

  branches: Branch[] = [];
  jwtToken: string | null = '';

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  errorMessage: string | null = '';
  constructor(
    private apiService: ApicallsService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  pageChanged(event: any): void {}
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    this.jwtToken = localStorage.getItem('jwtToken');
    console.log('Retrieved token from localStorage:', this.jwtToken);
    if (this.jwtToken) {
      this.loadBranches();
    } else {
      console.error('JWT token not found in localStorage.');
    }
  }

  loadBranches(): void {
    if (!this.jwtToken) return;
    this.apiService.getBranches().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.branches = response.data.map((branch: any) => ({
            id: branch.id,
            branchCode: branch.branchCode,
            branchName: branch.branchName,
            branchAddress: branch.branchAddress,
          }));
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          this.dataSource.data = this.branches;
          console.log('branches Loaded:', this.branches);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Failed to load branches. Please try again later.',
          error
        );
      },
    });
  }
  editBranch(branch: any) {
    const dialogRef = this.dialog.open(EditBranchComponent, {
      width: '400px',
      data: { branch: { ...branch } },
    });
    console.log('from update branch ', branch); // Check if branch has the correct structure

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.branches.findIndex(
          (u) => u.branchCode === result.branchCode
        );
        if (index !== -1) {
          this.branches[index] = result;
        }
      }
      this.cdr.detectChanges();
      this.loadBranches();
    });
  }

  addBranch() {
    const dialogRef = this.dialog.open(AddBranchComponent, {
      width: '400px',
      data: { branch: {} },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.branches.push(result); // Add the new branch to the array
      }
      this.cdr.detectChanges();
      this.loadBranches(); // Reload the list of branches (or perform any other necessary actions)
    });
  }

  deleteBranch(branchID: number): void {
    this.errorMessage = '';

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this branch?'
    );

    if (confirmDelete) {
      this.apiService.deleteBranch(branchID).subscribe({
        next: () => {
          console.log('Branch deleted successfully');
          this.loadBranches(); // Reload branches after deletion
        },
        error: (error: any) => {
          this.errorMessage =
            'Failed to delete branch. Please try again later.';
          console.error('Delete branch error:', error);
        },
      });
    } else {
      console.log('Deletion cancelled');
    }
  }
  exportToExcel(): void {
    const filteredData = this.dataSource.filteredData; // Get only the filtered rows
    if (filteredData.length === 0) {
      alert('No data available to export!');
      return;
    }
    const dataForExport = filteredData.map((row) => ({
      'Branch Code': row.branchCode,
      'Branch Name': row.branchName,
      'Branch Address': row.branchAddress,
    
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
      row.branchCode,
      row.branchName,
      row.branchAddress,
    ]);
    console.log(dataForExport)
    // Create PDF and add table
    const doc = new jsPDF();
    // const imgData = '../../assets/report.png';
    const imgData = '../../../assets/report.png';
    const today = new Date();
    const dateString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    const imgWidth = 100;
    const imgHeight = 50;

    // Calculate the x position to center the image
    const x = (doc.internal.pageSize.width - imgWidth) / 2;

    // Add the image to the PDF, positioning it in the center horizontally
    doc.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight);
    //doc.addImage(imgData, 'PNG', 10, 10, 150, 50);
    doc.text(`Date: ${dateString}`, 10, 60); 
    doc.text('Filtered Branches Report', 10, 70);
    doc.autoTable({
      head: [
        [
          'Branch Code',
          'Branch Name',
          'Branch Address',
                 ],
      ],
      body: dataForExport,
      startY: 80, // Ensure the table starts after the image and title
    });
    doc.save('Branch Report.pdf');
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
            `${row.branchCode},${row.branchName},${row.branchAddress}`
        )
        .join('\n');

    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'Branch Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
