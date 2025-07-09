import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';
import { ApicallsService } from '../Service/user-management.service';


@Component({
  selector: 'password-reset-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './password-reset-form.component.html',
  styleUrl: './password-reset-form.component.scss'
})
export class PasswordResetFormComponent implements OnInit {
  resetToken: string | null = null;
  resetPasswordForm: FormGroup;
    errorMessage: string = '';
    error: string = '';

    successMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private apicall: ApicallsService,
        private fb: FormBuilder,
        private router: Router,
        private http: HttpClient
      ) {
        this.resetPasswordForm = this.fb.group({
          newPassword: ['', [Validators.required, Validators.minLength(4)]],
          confirmPassword: ['', Validators.required]
        }
      
      );
      }

      ngOnInit(): void {
       
        this.route.queryParams.subscribe(params => {
          this.resetToken = params['token'];  
          if (this.resetToken) {
            console.log('Reset token:', this.resetToken);
          } else {
            console.error('No token found in the query parameters');
          }
        });
      }


onResetPassword() {
  
  if (this.resetPasswordForm.invalid) {
    this.errorMessage = 'Please fill in all the fields.';
    this.successMessage = '';
    return;
  }

  const { newPassword, confirmPassword } =
  this.resetPasswordForm.value;


if (newPassword !== confirmPassword) {
  this.errorMessage = 'passwords do not match!';
  this.successMessage = '';
  return;
}


if (!this.resetToken) {
  this.errorMessage = 'No reset token found!';
  this.successMessage = '';
  return;
}

console.log(this.resetToken);

this.apicall.resetPassword(this.resetToken, newPassword).subscribe({ next: (data) => {
  this.errorMessage = '';
  this.successMessage = data.message;
}, error: (error) => {
  console.error('Error resetting password:', error);

  if (error.status === 400 && error.error?.message) {
    this.errorMessage = error.error.message;
    this.successMessage = '';
  } else {
    this.errorMessage = 'An error occurred while resetting the password.';
    this.successMessage = '';
  }
}});

}

}

