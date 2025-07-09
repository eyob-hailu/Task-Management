package com.example.SpringProject.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Dto.TaskDTO;
import com.example.SpringProject.Service.TaskService;
import com.example.SpringProject.entity.TaskEntity;

@RestController
@RequestMapping("/api/requester/")
public class RequesterController {

	private TaskService taskService;
	// Endpoint to get users with the "Employee" role

	@Autowired
	public RequesterController(TaskService taskService) {
		this.taskService = taskService;
	}

	@GetMapping("stats/{requestorId}")
	public ResponseEntity<Map<String, Object>> getStatsForManager(@PathVariable Long requestorId) {
		Map<String, Object> stats = taskService.RequestorStats(requestorId);
		return ResponseEntity.ok(stats);
	}

	@PostMapping("createtask")
	public ResponseEntity<CustomResponse<TaskEntity>> createTask(@RequestBody TaskDTO taskDto) {
		// Call the service to create the task
		CustomResponse<TaskEntity> savedTaskResponse = taskService.createTask(taskDto);
		return new ResponseEntity<>(savedTaskResponse, HttpStatus.CREATED);
	}

	// Get all tasks
	@GetMapping("getalltasks")
	public ResponseEntity<CustomResponse<List<TaskDTO>>> getAllTasks() {
		List<TaskDTO> tasks = taskService.getAllTasks(); // This now returns List<TaskDto>
		return new ResponseEntity<>(new CustomResponse<>("Tasks retrieved successfully", tasks), HttpStatus.OK);
	}

	// update a task
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

	// deleting a task
	@DeleteMapping("deletetask/{id}")
	public ResponseEntity<CustomResponse<Void>> deleteTask(@PathVariable("id") Long id) {
		Optional<TaskEntity> task = taskService.getTaskById(id);
		if (task.isPresent()) {
			taskService.deleteTask(id);
			return new ResponseEntity<>(new CustomResponse<>("Task deleted successfully", null), HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(new CustomResponse<>("Task not found", null), HttpStatus.NOT_FOUND);
		}
	}

}
