import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user-management.service';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  deadline: string | null; // LocalDate from the backend in "yyyy-MM-dd" format
  creatorId: number; // ID of the user who created the task
  assignee: number | null; // ID of the user to whom the task is assigned
}

export interface Tasks {
  creatorUsername: any;
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  deadline: string | null; // LocalDate from the backend in "yyyy-MM-dd" format
  remark: string;
  creatorId: number; // ID of the user who created the task
  assignedUserId: string | number | null; // ID of the user to whom the task is assigned
}

@Injectable({
  providedIn: 'root',
})
export class taskapicalls {
  private api = 'http://localhost:9191/api/manager';
  private apiRequester = 'http://localhost:9191/api/requester';
  currentUser = signal(null);

  constructor(private http: HttpClient) {}

  // Get all tasks
  getAllTasksRequestor(): Observable<Tasks[]> {
    return this.http.get<Tasks[]>(`${this.apiRequester}/getalltasks`);
  }

  getAllTasks(): Observable<Tasks[]> {
    return this.http.get<Tasks[]>(`${this.api}/getalltasks`);
  }
  getEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/employees`);
  }

  // Get a single task by ID
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.api}/gettask/${id}`);
  }

  // Create a new task
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiRequester}/createtask`, task);
  }

  // Update an existing task
  editTask(id: number, task: Tasks): Observable<Task> {
    return this.http.put<Task>(`${this.api}/updatetask/${id}`, task);
  }

  editTaskRequest(id: number, task: Tasks): Observable<Task> {
    return this.http.put<Task>(`${this.apiRequester}/updatetask/${id}`, task);
  }

  // Delete a task by ID
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRequester}/deletetask/${id}`);
  }

  assignTask(
    taskId: number,
    userId: string | number | null,
    managerId: string | number | null
  ): Observable<Task> {
    const url = `${this.api}/assigntask/${taskId}`;
    const payload = { userId, managerId }; // Create the payload with userId and managerId
    return this.http.put<Task>(url, payload); // Send the payload to the backend
  }

  getManagerStat(managerId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/stats/${managerId}`);
  }

  getEmployeeStats(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/employeestats/${employeeId}`);
  }

  getRequesterStat(requesterId: number): Observable<any> {
    return this.http.get<any>(`${this.apiRequester}/stats/${requesterId}`);
  }
}
