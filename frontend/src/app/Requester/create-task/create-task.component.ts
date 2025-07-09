import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { taskapicalls, Task } from '../../Service/task-management.service';

@Component({
  selector: 'create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
  providers: [DatePipe],
})
export class CreateTaskComponent implements OnInit {
  taskForm!: FormGroup;
  errorMessages: string = '';
  successMessage: string = '';
  today: string = '';

  constructor(
    private fb: FormBuilder,
    private taskService: taskapicalls,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe // Inject DatePipe
  ) {
    this.taskForm = this.fb.group({
      priority: ['', [Validators.required]],
      deadline: ['', [Validators.required]],
      description: ['', [Validators.required]],
      title: ['', [Validators.required]],
    });
  }
  preventTyping(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent typing in the input field
  }
  ngOnInit(): void {
    const currentDate = new Date();
    // Format the date as yyyy-mm-dd
    this.today = currentDate.toISOString().split('T')[0]; //to restrict choosing the day befor today
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      Object.keys(this.taskForm.controls).forEach((control) => {
        const controlObj = this.taskForm.get(control);
        if (controlObj?.invalid) {
          if (controlObj.hasError('required')) {
            this.errorMessages = `${control} can not be empty! .`;
          }
        }
      });
      return;
    }

    const userId = localStorage.getItem('id');
    if (!userId) {
      this.errorMessages =
        'Authentication token not found. Please log in again.';
      this.cdr.detectChanges();
      return;
    }
    const formattedDeadline = this.datePipe.transform(
      this.taskForm.value.deadline,
      'dd-MM-yyyy'
    );
    const newTask = {
      id: 0, // Backend will generate the ID
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      priority: this.taskForm.value.priority,
      status: 'Draft', // Default status for new task
      deadline: formattedDeadline,
      creatorId: parseInt(userId, 10), // Convert to number
      assignee: null, // Unassigned by default
      
    };
    console.log(newTask);
    this.taskService.createTask(newTask).subscribe({
      next: (response) => {
        console.log('Task created successfully:', response);
        this.successMessage = 'Task Created Successfully';
        this.errorMessages = '';
        this.taskForm.reset(); // Clear the form after successful submission
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        if (error.status === 400 && error.error?.message) {
          this.errorMessages = error.error.message;
        } else {
          this.errorMessages =
            'Failed to create the task. Please try again later.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
