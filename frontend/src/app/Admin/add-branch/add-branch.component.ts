import { CommonModule } from '@angular/common';
import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApicallsService, Branch } from '../../Service/user-management.service';

@Component({
  selector: 'add-branch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-branch.component.html',
  styleUrl: './add-branch.component.scss',
})
export class AddBranchComponent implements OnInit {
  addBranchForm: FormGroup;
  errorMessages: string = '';
  jwtToken: string | null = null;
  ngOnInit(): void {}

  constructor(
    public dialogRef: MatDialogRef<AddBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch: Branch },
    private fb: FormBuilder,
    private apicallsService: ApicallsService,
    private cdr: ChangeDetectorRef
  ) {
    this.addBranchForm = this.fb.group({
      branchCode: [
        data.branch.branchCode,
        [Validators.required, Validators.pattern(/^HB.*/)],
      ],
      branchName: [data.branch.branchName, [Validators.required]],
      branchAddress: [data.branch.branchAddress, [Validators.required]],
    });
  }
  onSubmit(): void {
    this.errorMessages = '';

    // Check if the form is invalid
    if (this.addBranchForm.invalid) {
      this.showValidationErrors();
      return;
    }

    // Check for authentication token
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }
    const addBranch = this.addBranchForm.value;

    // Call the API to add the branch
    this.apicallsService.addBranch(addBranch).subscribe({
      next: (response) => {
        console.log('Branch created successfully:', response);

        // Close the dialog and pass the new branch data back to the parent
        this.dialogRef.close(response); // Pass the response (or addBranch) to the parent
      },
      error: (error) => {
        console.error('Error creating branch:', error);
        this.errorMessages =
          error.error?.message || 'Failed to create branch. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  private showValidationErrors(): void {
    Object.keys(this.addBranchForm.controls).forEach((controlName) => {
      const control = this.addBranchForm.get(controlName);
      if (control?.invalid) {
        if (control.hasError('required')) {
          this.errorMessages = `${controlName} is required.`;
        }
        if (control.hasError('pattern')) {
          this.errorMessages = `${controlName} must start with 'HB'.`;
        }
      }
    });
    this.cdr.detectChanges();
  }
  closeModal(): void {
    this.dialogRef.close();
  }
}
