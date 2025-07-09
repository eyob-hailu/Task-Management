import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ApicallsService,
  Branch,
  User,
} from '../../Service/user-management.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

@Component({
  selector: 'edit-user',
  standalone: true,
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class EditUserComponent implements OnInit {

 
  editUserForm: FormGroup;
  errorMessages: string = '';
  branches: Branch[] = [];
  showBranchSelect = false; // Controls the display of the second dropdown

  constructor(
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder,
    private apicallsService: ApicallsService,
    private cdr: ChangeDetectorRef
  ) {
    this.editUserForm = this.fb.group({
      firstname: [data.user.firstname, [Validators.required]],
      middlename: [data.user.middlename, [Validators.required]],
      lastname: [data.user.lastname, [Validators.required]],
      phonenumber: [
        data.user.phonenumber,
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      email: [data.user.email, [Validators.required, Validators.email]],
      username: [
        data.user.username,
        [Validators.required, Validators.minLength(5)],
      ],
      officetype: [data.user.officetype, [Validators.required]],
      branch: [data.user.branchid, []],
    });
  }

  saveChanges(): void {
    this.errorMessages = '';
    if (this.editUserForm.invalid) {
      this.showValidationErrors();
      return;
    }
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }
    const updatedUserData = this.editUserForm.value;
    if (updatedUserData.officetype === 'head_office') {
      updatedUserData.branch = null;
    }
    else if (updatedUserData.officetype === 'branch' && updatedUserData.branch) {
      updatedUserData.branchid = updatedUserData.branch.id;  // Use the branch's ID as branchid
      delete updatedUserData.branch;  // Remove the branch object from the request payload
    }
    this.apicallsService
      .editUser(this.data.user.id, updatedUserData)
      .subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.apicallsService.currentUser.set(updatedUserData);
          this.dialogRef.close(updatedUserData);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessages =
            error.error?.message || 'Failed to update user. Please try again.';
         // console.log(error.error.message);
          this.cdr.detectChanges();
        },
      });
  }
  onBranchChange(event: Event): void {
    const selectedBranchId = (event.target as HTMLSelectElement).value;
    const selectedBranch = this.branches.find(b => b.id === Number(selectedBranchId));
    if (selectedBranch) {
      this.editUserForm.get('branch')?.setValue(selectedBranch); // Update form control value with entire branch object
    //this.editUserForm.get('branch')?.setValue(selectedBranchId); // Update form control value with branch id
  this.cdr.detectChanges();  
  }
    //this.editUserForm.get('branch')?.setValue(selectedBranchId); // Update form control value with branch id
   
    this.cdr.detectChanges();
  }
  private showValidationErrors(): void {
    Object.keys(this.editUserForm.controls).forEach((controlName) => {
      const control = this.editUserForm.get(controlName);
      if (control?.invalid) {
        if (control.hasError('required')) {
          this.errorMessages = `${controlName} is required.`;
        } else if (control.hasError('minlength')) {
          const minLength = control.errors?.['minlength'].requiredLength;
          this.errorMessages = `${controlName} must be at least ${minLength} characters long.`;
        } else if (control.hasError('pattern')) {
          this.errorMessages = ` ${controlName} must be  number and 10 digits.`;
        }
        else if (control.hasError('email')) {
          this.errorMessages = `${controlName} must be a valid email address. example@gmail.com`;
        }
        
      }
    });

    this.cdr.detectChanges();
  }
  closeModal(): void {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    this.loadBranches();
    this.setInitialBranch();
    if (this.data.user.officetype === 'branch') {
      this.showBranchSelect = true;
      this.editUserForm.get('officetype')?.setValue('branch');
    } else if (this.data.user.officetype === 'head_office') {
      this.showBranchSelect = false;
      this.editUserForm.get('head_office')?.setValue('head_office');
      this.editUserForm.get('branch')?.setValue(null); // Ensure branch is null
    }
    this.cdr.detectChanges();
  }
  // Method to populate the branches list and pre-select the user's branch
  loadBranches(): void {
    this.apicallsService.getBranches().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.branches = response.data.map((branch: any) => ({
            id: branch.id,
            branchCode: branch.branchCode ,
            branchName: branch.branchName,
          }));
          this.setInitialBranch(); // Set branch after loading branches
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Failed to load branches. Please try again later.', error);
      },
    });
  }
  // Set the initial branch if the user's office type is "branch"
  private setInitialBranch(): void {
    if (this.data.user.officetype === 'branch') {
      const userBranch = this.branches.find(b => b.id === this.data.user.branchid);
      if (userBranch) {
        this.editUserForm.get('branch')?.setValue(userBranch.id); // Set the branch id initially
        this.showBranchSelect = true;
      }
    }
  }
  // Handle office type changes dynamically
  onOfficeTypeChange(event: Event): void {
    const selectedOfficeType = (event.target as HTMLSelectElement).value;
  
    if (selectedOfficeType === 'branch') {
      this.showBranchSelect = true;
      this.editUserForm.get('branch')?.setValidators(Validators.required); // Make branch required
    } else if (selectedOfficeType === 'head_office') {
      this.showBranchSelect = false;
      this.editUserForm.get('head_office')?.setValue('head_office');
      this.editUserForm.get('branch')?.clearValidators(); // Remove validation
      this.editUserForm.get('branch')?.setValue(null); // Set branch to null
    }
    this.editUserForm.get('branch')?.updateValueAndValidity(); // Update validation
  }
}  

 