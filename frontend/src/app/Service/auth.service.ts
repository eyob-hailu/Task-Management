import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:9191/api/login';

  private authenticate = false;

  loginCheck() {
    this.authenticate = true;
  }

  logoutCheck() {
    this.authenticate = false;
  }

  isAuthenticated(): boolean {
    return this.authenticate;
  }

  constructor(private http: HttpClient, private router: Router) {}

  login(loginData: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, loginData);
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('jwtToken');
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token); // Decode the token
      const expDate = decoded.exp * 1000; // Convert expiration to milliseconds

      if (Date.now() >= expDate) {
        this.router.navigate(['/login']).then(() => {
          alert('Session Expired. Please login again!');
        });
        return true; // Token is expired
      }
      return false; // Token is not expired
    } catch (error) {
      this.router.navigate(['/login']).then(() => {
        alert('Session Expired. Please login again!');
      });
      console.error('Error decoding token:', error); // Log the error
      return true; // Assume the token is expired if decoding fails
    }
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
