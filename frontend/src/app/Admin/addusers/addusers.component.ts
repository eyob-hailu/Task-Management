import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ApicallsService,
  Branch,
  User,
} from '../../Service/user-management.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {  } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'addusers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatSelectModule,MatInputModule,MatFormFieldModule,RouterModule],
  templateUrl: './addusers.component.html',
  styleUrls: ['./addusers.component.scss'],
})
export class AddusersComponent implements OnInit {
  addUserForm: FormGroup;
  errorMessages: string = '';

  showBranchSelect = false; // Controls the display of the second dropdown
  
  branches: Branch[] = [];
  constructor(
    private fb: FormBuilder,
    private apicallsService: ApicallsService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.addUserForm = this.fb.group(
      {
        firstname: ['', [Validators.required]],
        middlename: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        phonenumber: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        officeType: ['', [Validators.required]],
        branch: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(5)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(5)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }
  ngOnInit(): void {
    this.loadBranches();
  }
  passwordMatchValidator(group: FormGroup): void {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    group.get('confirmPassword')?.setErrors(null);

    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordsDoNotMatch: true });
    }
  }

  onOfficeTypeChange(event: any): void {
    const selectedOfficeType = (event.value );

    if (selectedOfficeType === 'branch') {
      this.showBranchSelect = true;
      this.addUserForm.get('branch')?.setValidators(Validators.required); // Make branch required
    } else {
      this.showBranchSelect = false;
      this.addUserForm.get('branch')?.clearValidators(); // Remove validation
      this.addUserForm.get('branch')?.setValue(''); // Reset the branch field
    }

    this.addUserForm.get('branch')?.updateValueAndValidity(); // Update validation
  }
  onSubmit(): void {
    this.errorMessages = '';

    if (this.addUserForm.invalid) {
      Object.keys(this.addUserForm.controls).forEach((control) => {
        const controlObj = this.addUserForm.get(control);
        if (controlObj?.invalid) {
          if (controlObj.hasError('required')) {
            this.errorMessages = `${control} is required`;
          }
          if (controlObj.hasError('minlength')) {
            const minlengthError = controlObj.errors?.['minlength'];
            this.errorMessages = `${control} must be at least ${minlengthError?.requiredLength} characters long`;
          }
          if (controlObj.hasError('email')) {
            const minlengthError = controlObj.errors?.['email'];
            this.errorMessages = `${control} must be have a valid email format`;
          }
          if (controlObj.hasError('pattern')) {
            this.errorMessages = `${control} must be  number and 10 digits`;
          }
          if (controlObj.hasError('passwordsDoNotMatch')) {
            this.errorMessages = 'Passwords do not match';
          }
        }
      });
      return;
    }

    const formValues = this.addUserForm.value;

    // const userData = this.addUserForm.value;
    const userData = {
      id: 0, // Assign a default value or generate an ID if needed
      firstname: formValues.firstname,
      middlename: formValues.middlename,
      lastname: formValues.lastname,
      phonenumber: formValues.phonenumber,
      officetype: formValues.officeType,
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
      branchid: formValues.officeType === 'branch' ? formValues.branch : null, // Include branchId only for branch office
      roles: [], // Assign default roles or fetch roles if needed
    };
    const token = localStorage.getItem('jwtToken');

    

    this.apicallsService.registerUser(userData).subscribe({
    
      next: (response) => {
        console.log('User added successfully:', response);
        alert('User registered successfully!');
        this.errorMessages = '';
        this.addUserForm.reset();
        this.router.navigate(['/admin/manage-users']);
      },
      error: (error) => {
        console.error('Error adding user:', error);
        if (error.status === 400 && error.error?.message) {
          console.log(error.error.message);
          this.errorMessages = error.error.message;
        } else {
          this.errorMessages =
            'Failed to register user. Please try again later.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  loadBranches(): void {
    this.apicallsService.getBranches().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.branches = response.data.map((branch: any) => ({
            id: branch.id,
            branchCode: branch.branchCode,
            branchName: branch.branchName,
          }));
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(
          'Failed to load branches. Please try again later.',
          error
        );
      },
    });
  }
}
