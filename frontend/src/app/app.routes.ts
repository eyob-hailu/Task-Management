import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './shared/components/Layout/Layout.component';
import { ManageusersComponent } from './Admin/manageusers/manageusers.component';
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard.component';
import { AddusersComponent } from './Admin/addusers/addusers.component';
import { ChangePasswordComponent } from './CommonComponents/change-password/change-password.component';
import { authGuard } from './Service/auth.guard';
import { noAuthGuard } from './Service/auth.guard';
import { ManageTaskComponent } from './Manager/manage-task/manage-task.component';
import { CreateTaskComponent } from './Requester/create-task/create-task.component';
import { roleGuard } from './Service/role.guard';
import { ManagerDashboardComponent } from './Manager/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './Employee/employee-dashboard/employee-dashboard.component';
import { ViewtasksComponent } from './Employee/viewtasks/viewtasks.component';
import { ManageBranchComponent } from './Admin/manage-branch/manage-branch.component';
import { RequesterDashboardComponent } from './Requester/requester-dashboard/requester-dashboard.component';
import { ViewRequesterTasksComponent } from './Requester/view-requester-tasks/view-requester-tasks.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PasswordResetFormComponent } from './password-reset-form/password-reset-form.component';
import { ReportsComponent } from './reports/reports.component';

export const routes: Routes = [
  // Public Routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'reset-password',
    component: PasswordResetFormComponent,
    canActivate: [noAuthGuard],
  },

  {
    path: 'change-password',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: ChangePasswordComponent,
        canActivate: [authGuard],
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [authGuard],
      },
    ],
  },
  

  // Admin Routes
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      {
        path: 'manage-users',
        component: ManageusersComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'add-user',
        component: AddusersComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'manage-branch',
        component: ManageBranchComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
      },
    ],
  },

  // Manager Routes
  {
    path: 'manager',
    component: LayoutComponent,
    children: [
      {
        path: 'manage-tasks',
        component: ManageTaskComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Manager'] },
      },
      {
        path: 'manager-dashboard',
        component: ManagerDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Manager'] },
      },
    ],
  },

  // Employee Routes
  {
    path: 'employee',
    component: LayoutComponent,
    children: [
      {
        path: 'employee-dashboard',
        component: EmployeeDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Employee'] },
      },
      {
        path: 'view-tasks',
        component: ViewtasksComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Employee'] },
      },
    ],
  },

  // Requester Routes
  {
    path: 'requester',
    component: LayoutComponent,
    children: [
      {
        path: 'requester-dashboard',
        component: RequesterDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Requester'] },
      },
      {
        path: 'view-requester-tasks',
        component: ViewRequesterTasksComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Requester'] },
      },
      {
        path: 'add-task',
        component: CreateTaskComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Requester'] },
      },
    ],
  },
];
