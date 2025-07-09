import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApicallsService, User } from '../../Service/user-management.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApicallsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Please fill in all the fields.';
      this.successMessage = '';
      return;
    }

    const { oldPassword, newPassword, confirmPassword } =
      this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'passwords do not match!';
      this.successMessage = '';
      return;
    }

    const id = localStorage.getItem('id');
    if (!id) {
      alert('User not found!');
      return;
    }

    this.apiService
      .changePassword(Number(id), oldPassword, newPassword)
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.successMessage = 'Password Updated Succesfully';
          this.cdr.detectChanges();
          //this.router.navigate(['/login']); // Redirect after successful password change
        },
        error: (error) => {
          console.error('Error changing passwrod:', error);

          if (error.status === 400 && error.error?.message) {
            this.errorMessage = error.error.message;
            console.log(this.errorMessage);
            this.successMessage = '';
            this.cdr.detectChanges();
          } else if (
            error.status === 400 &&
            error.error?.message ===
              'New password cannot be the same as the current password.'
          ) {
            console.log(error.error.message);
            this.errorMessage = error.error.message;
            this.successMessage = '';
          }

          console.error('Error updating password', error);
        },
      });
    this.cdr.detectChanges();
  }

  // Getter for form controls to make it easier to access in the template
  get f() {
    return this.passwordForm.controls;
  }
}
