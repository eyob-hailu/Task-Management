import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApicallsService } from '../Service/user-management.service';

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

    forgetPasswordForm: FormGroup;
    errorMessage: string = '';
    error: string = '';
    successMessage: string = '';
    success: string = '';
    

    constructor(
         private apicallsService: ApicallsService,
        private fb: FormBuilder,
        private router: Router,
        private http: HttpClient
      ) {
        this.forgetPasswordForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
        });
      }

      forgetpassword() {
        this.apicallsService.forgetPassword(this.forgetPasswordForm.value.email).subscribe({
          next: (data) => {
            this.error = '';
            this.errorMessage = '';
            this.successMessage = data.message;
          },
          error: (error) => {
            this.success = '';
      
            this.successMessage = '';
            this.error = error.message;
            this.errorMessage = error.error.message;
          },
          complete: () => {
            console.log('Forgot password request completed.');
          }
        });
      }
      

}
