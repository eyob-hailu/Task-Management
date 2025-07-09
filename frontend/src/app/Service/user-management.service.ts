import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  phonenumber: string;
  username: string;
  email: string;
  roles: { id: number; role: string }[];
  officetype: string;
  branchid?: number;
  branch?: Branch
}
export interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  usersWithNoRole:number;
  usersPerRole: { role: string; count: number }[];
}

export interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  branchAddress: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApicallsService {
  private api = 'http://localhost:9191';
  currentUser = signal(null);

  constructor(private http: HttpClient) {}

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.api + '/api/admin/branch');
  }
  addBranch(branch: Branch): Observable<any> {
    return this.http.post<any>(this.api + '/api/admin/branch', branch);
  }
  updateBranch(id: number, branch: Branch): Observable<any> {
    return this.http.put<any>(this.api + `/api/admin/branch/${id}`, branch);
  }
  deleteBranch(id: number): Observable<any> {
    return this.http.delete<any>(this.api + `/api/admin/branch/${id}`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.api + '/api/admin/getusers');
  }

  registerUser(userData: User): Observable<any> {
    return this.http.post<any>(this.api + '/api/admin/register', userData);
  }
  editUser(id: number, userData: User): Observable<any> {
    return this.http.put<any>(
      this.api + `/api/admin/updateuser/${id}`,
      userData
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(this.api + `/api/admin/deleteuser/${id}`);
  }
  assignRole(
    id: number,
    roles: { id: string; role: string }[]
  ): Observable<any> {
    return this.http.put<any>(`${this.api}/api/admin/assignroles/${id}`, roles);
  }
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.api + '/api/role');
  }
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.api + '/api/admin/stats');
  }
  changePassword(
    id: number,
    password: string,
    newPassword: string
  ): Observable<any> {
    const data = {
      password,
      newPassword,
    };
    return this.http.put<any>(`${this.api}/api/changepassword/${id}`, data);
  }

  forgetPassword(email: string): Observable<any> {
    const body = { email }; // Send as an object { email: 'example@gmail.com' }
    const headers = { 'Content-Type': 'application/json' };
  
    return this.http.post<any>(this.api + '/reset/forgot_password', body, { headers });
  }
  
  
  resetPassword(token: string, newPassword: string): Observable<any> {

    const params = new HttpParams().set('token', token);
    const body = { newPassword };
    return this.http.post<any>(this.api + '/reset/reset_password', body, { params });
  }

  bulkUploadUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.api + '/api/admin/bulk-upload', formData);
  }


}
