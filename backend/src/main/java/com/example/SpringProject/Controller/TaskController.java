package com.example.SpringProject.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Dto.TaskDTO;
import com.example.SpringProject.Service.TaskService;
import com.example.SpringProject.entity.TaskEntity;

import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/manager/")
public class TaskController {

	private TaskService taskService;
	// Endpoint to get users with the "Employee" role

	@Autowired
	public TaskController(TaskService taskService) {
		this.taskService = taskService;
	}

	@GetMapping("/stats/{managerId}")
	public ResponseEntity<Map<String, Object>> getStatsForManager(@PathVariable Long managerId) {
		Map<String, Object> stats = taskService.ManagerStats(managerId);
		return ResponseEntity.ok(stats);
	}

	@GetMapping("/employeestats/{employeeId}")
	public ResponseEntity<Map<String, Object>> getStatsForEmployee(@PathVariable Long employeeId) {
		Map<String, Object> stats = taskService.EmployeeStats(employeeId);
		return ResponseEntity.ok(stats);
	}

	@PutMapping("/assigntask/{taskId}")
	public ResponseEntity<?> assignTask(@PathVariable("taskId") Long taskId, @RequestBody Map<String, Long> payload)
			throws MessagingException {
		Long userId = payload.get("userId"); // Extract userId from the JSON body
		Long managerId = payload.get("managerId");

		try {
			TaskEntity updatedTask = taskService.assignTask(taskId, userId, managerId);
			return new ResponseEntity<>(updatedTask, HttpStatus.OK);
		} catch (RuntimeException e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
		}
	}

	// Create a new task
//	@PostMapping("createtask")
//	public ResponseEntity<CustomResponse<TaskEntity>> createTask(@RequestBody TaskDTO taskDto) {
//		// Call the service to create the task
//		CustomResponse<TaskEntity> savedTaskResponse = taskService.createTask(taskDto);
//		return new ResponseEntity<>(savedTaskResponse, HttpStatus.CREATED);
//	}

	// Update a task
	@PutMapping("updatetask/{id}")
	public ResponseEntity<CustomResponse<TaskEntity>> updateTask(@PathVariable("id") Long id,
			@RequestBody TaskEntity taskDetails) {
		try {
			TaskEntity updatedTask = taskService.updateTask(id, taskDetails);
			return new ResponseEntity<>(new CustomResponse<>("Task updated successfully", updatedTask), HttpStatus.OK);
		} catch (RuntimeException e) {
			return new ResponseEntity<>(new CustomResponse<>("Task not found", null), HttpStatus.NOT_FOUND);
		}
	}

	// Get all tasks
	@GetMapping("getalltasks")
	public ResponseEntity<CustomResponse<List<TaskDTO>>> getAllTasks() {
		List<TaskDTO> tasks = taskService.getAllTasks(); // This now returns List<TaskDto>
		return new ResponseEntity<>(new CustomResponse<>("Tasks retrieved successfully", tasks), HttpStatus.OK);
	}

	// Get a single task by id
	@GetMapping("gettask/{id}")
	public ResponseEntity<CustomResponse<TaskEntity>> getTaskById(@PathVariable("id") Long id) {
		Optional<TaskEntity> task = taskService.getTaskById(id);
		if (task.isPresent()) {
			return new ResponseEntity<>(new CustomResponse<>("Task retrieved successfully", task.get()), HttpStatus.OK);
		} else {
			return new ResponseEntity<>(new CustomResponse<>("Task not found", null), HttpStatus.NOT_FOUND);
		}
	}
}
