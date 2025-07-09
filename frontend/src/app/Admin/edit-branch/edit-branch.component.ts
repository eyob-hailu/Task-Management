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
  selector: 'edit-branch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-branch.component.html',
  styleUrl: './edit-branch.component.scss',
})
export class EditBranchComponent implements OnInit {
  editBranchForm: FormGroup;
  errorMessages: string = '';
  jwtToken: string | null = null;
  ngOnInit(): void {}

  constructor(
    public dialogRef: MatDialogRef<EditBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch: Branch },
    private fb: FormBuilder,
    private apicallsService: ApicallsService,
    private cdr: ChangeDetectorRef
  ) {
    this.editBranchForm = this.fb.group({
      branchCode: [
        data.branch.branchCode,
        [Validators.required, Validators.pattern(/^HB.*/)],
      ],
      branchName: [data.branch.branchName, [Validators.required]],
      branchAddress: [data.branch.branchAddress, [Validators.required]],
    });
  }
  saveChanges(): void {
    this.errorMessages = '';

    if (this.editBranchForm.invalid) {
      this.showValidationErrors();
      return;
    }

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    const updatedBranch = this.editBranchForm.value;
    this.apicallsService
      .updateBranch(this.data.branch.id, updatedBranch)
      .subscribe({
        next: (response) => {
          console.log('Branch updated successfully:', response);
          this.apicallsService.currentUser.set(updatedBranch);
          this.dialogRef.close(updatedBranch);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessages =
            error.error?.message || 'Failed to update user. Please try again.';
          console.log(error.error.message);
          this.cdr.detectChanges();
        },
      });
  }

  private showValidationErrors(): void {
    Object.keys(this.editBranchForm.controls).forEach((controlName) => {
      const control = this.editBranchForm.get(controlName);
      if (control?.invalid) {
        if (control.hasError('required')) {
          this.errorMessages = `${controlName} is required.`;
        }
        if (control.hasError('pattern')) {
          this.errorMessages = `${controlName} must start with HB.`;
        }
      }
    });
    this.cdr.detectChanges();
  }
  closeModal(): void {
    this.dialogRef.close();
  }
}
