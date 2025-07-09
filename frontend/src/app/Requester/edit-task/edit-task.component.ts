import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { taskapicalls, Task } from '../../Service/task-management.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'edit-task',
  standalone: true,
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss'],
  imports: [ReactiveFormsModule, CommonModule],
  providers: [DatePipe],
})
export class EditTaskComponent {
  editTaskForm: FormGroup;
  errorMessages: string = '';
  minDate: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task },
    private fb: FormBuilder,
    private taskapiService: taskapicalls,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe // Inject DatePipe
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.editTaskForm = this.fb.group({
      title: [data.task.title, [Validators.required]],
      description: [data.task.description, [Validators.required]],
      priority: [data.task.priority, [Validators.required]],
      deadline: [data.task.deadline, [Validators.required]],
    });
  }
  preventTyping(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent typing in the input field
  }

  saveChanges(): void {
    this.errorMessages = '';

    if (this.editTaskForm.invalid) {
      this.showValidationErrors();
      return;
    }
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    // Format the deadline value using DatePipe
    const formattedDeadline = this.datePipe.transform(
      this.editTaskForm.value.deadline,
      'dd-MM-yyyy'
    );

    // Update the form control with the formatted date
    this.editTaskForm.patchValue({
      deadline: formattedDeadline,
    });

    // Now, proceed with the task update
    //const updatedTaskData = this.editTaskForm.value;
    const updatedTaskData = {
      ...this.editTaskForm.value, // Include all form values
      status: this.data.task.status, // Explicitly include the original status
    };

    this.taskapiService
      .editTaskRequest(this.data.task.id, updatedTaskData)
      .subscribe({
        next: (response: any) => {
          console.log('Task updated successfully:', response);
          this.dialogRef.close(updatedTaskData);
        },
        error: (error: any) => {
          console.error('Error updating task:', error);
          this.errorMessages =
            error.error?.message || 'Failed to update task. Please try again.';
          console.log(error.error.message);
          this.cdr.detectChanges();
        },
      });
  }

  private showValidationErrors(): void {
    Object.keys(this.editTaskForm.controls).forEach((controlName) => {
      const control = this.editTaskForm.get(controlName);
      if (control?.invalid) {
        if (control.hasError('required')) {
          this.errorMessages = `${controlName} is required.`;
        } else if (control.hasError('minlength')) {
          const minLength = control.errors?.['minlength'].requiredLength;
          this.errorMessages = `${controlName} must be at least ${minLength} characters long.`;
        }
      }
    });

    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
