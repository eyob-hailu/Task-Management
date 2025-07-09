import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onLogin(): void {
    console.log(this.loginForm.value);
    if (this.loginForm.invalid) {
      this.error = 'Please fill in the required fields.';
      this.errorMessage = '';
      return;
    }
    this.error = '';
    const loginData = this.loginForm.value;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log(response);
        const token = response.data.token;
        if (token) {
          localStorage.setItem('jwtToken', token);
          console.log('Token saved to localStorage:', token);
        }
        const username = response.data.user.username;
        if (username) {
          localStorage.setItem('username', username);
          console.log('Username saved to localStorage:', username);
        }

        //console.log('id saved to local storage: ', password);
        const id = response.data.user.id;
        if (id) {
          localStorage.setItem('id', id);
          console.log('id saved to local storage: ', id);
        }
        const roles = response.data.user.roles?.map((role: any) => role.role);
        console.log(roles);

        if (roles) {
          localStorage.setItem('role', JSON.stringify(roles));
        }
        if (roles?.includes('Admin')) {
          this.router.navigate(['admin/dashboard']);
        } else if (roles?.includes('Manager')) {
          this.router.navigate(['manager/manager-dashboard']);
        } else if (roles?.includes('Employee')) {
          this.router.navigate(['employee/employee-dashboard']);
        } else if (roles?.includes('Requester')) {
          this.router.navigate(['requester/requester-dashboard']);
        }
        else{
          alert("you are not assiged to any role. You Can't Log in!");
          localStorage.clear();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Login failed:', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'please enter the correct username and password';
        } else if (err.status === 0 || err.status === 500) {
          this.errorMessage =
            'Could not connect to server. Please check your network.';
        } else {
          this.errorMessage =
            'An unexpected error occurred. Please try again later.';
        }
      },
    });
  }
}
