import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApicallsService } from '../../Service/user-management.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'assignrole',
  standalone: true,
  templateUrl: './assignrole.component.html',
  styleUrls: ['./assignrole.component.scss'],
  imports: [FormsModule, CommonModule, MatCheckboxModule,MatSelectModule],
})
export class AssignRoleComponent {
  roles: any[] = []; // List of all roles from the server
  filteredRoles: any[] = []; // Filtered roles based on office type
  selectedRoles: string|null=null ; // Array to hold selected role IDs
  isLoading: boolean = true; // Show loading indicator while roles are being fetched

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private apiService: ApicallsService,
    private dialogRef: MatDialogRef<AssignRoleComponent>
  ) {}

  ngOnInit(): void {
    console.log('User Office Type:', this.data.user.officetype);

    this.loadRoles();
    this.loadAssignedRoles(); // Load assigned roles for the user
  }

  // Fetch all available roles from the server
  loadRoles(): void {
    this.apiService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.filteredRoles = this.filterRolesByOfficeType(roles); // Apply the filter
        console.log(this.filteredRoles);
        console.log('Roles fetched:', roles);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
        this.isLoading = false;
      },
    });
  }

  // Load roles already assigned to the user
  loadAssignedRoles(): void {
    if (this.data.user && this.data.user.roles && this.data.user.roles.length > 0) {
      // Assign the first role only if there's at least one assigned role
      this.selectedRoles = this.data.user.roles[0].id; // Assigning just the first role
    } else {
      this.selectedRoles = null; // No role selected, so set to null
    }
  }
  

  // Check if a role is already assigned to the user
  // isRoleAssigned(roleId: string): boolean {
  //   return this.selectedRoles.includes(roleId);
  // }

  // onRoleToggle(roleId: string, isChecked: boolean): void {
  //   if (isChecked) {
  //     if (!this.selectedRoles.includes(roleId)) {
  //       this.selectedRoles.push(roleId);
  //     }
  //   } else {
  //     this.selectedRoles = this.selectedRoles.filter((id) => id !== roleId);
  //   }
  // }
  onRoleSelect(roleId: string) {
    this.selectedRoles = roleId;
  }
  filterRolesByOfficeType(roles: any[]): any[] {
    const officeType = this.data.user.officetype;
    if (officeType === 'head_office') {
      return roles.filter(role =>
        role.role && ['admin', 'manager', 'employee',].includes(role.role.toLowerCase())
      );
    } else if (officeType === 'branch') {
      return roles.filter(role => role.role && role.role.toLowerCase() === 'requester');
    }
    console.log('Unknown office type:', officeType);
    return roles; 
  }
  
  assignRoles(): void {
    // If selectedRoles is null, revoke the role by passing null to the backend
    const roles = this.selectedRoles ? [{
      id: this.selectedRoles,
      role: this.selectedRoles,
    }] : []; // Revoke role if no role is selected (empty array)
  
    this.apiService.assignRole(this.data.user.id, roles).subscribe({
      next: () => {
        if (roles === null) {
          console.log(`Role revoked for ${this.data.user.firstname} ${this.data.user.lastname}`);
        } else {
          console.log(`Role ${this.selectedRoles} assigned to ${this.data.user.firstname} ${this.data.user.lastname}`);
        }
        this.dialogRef.close(this.selectedRoles); // Close the modal with the selected role
      },
      error: (err) => {
        console.error('Error assigning roles:', err);
      },
    });
  
    window.location.reload(); // Refresh the page after assigning the role
  }
  
  
  // Close the modal without making changes
  closeModal(): void {
    this.dialogRef.close();
  }
}
