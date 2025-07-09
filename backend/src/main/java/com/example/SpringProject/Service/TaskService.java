package com.example.SpringProject.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Dto.TaskDTO;
import com.example.SpringProject.Dto.UserDto;
import com.example.SpringProject.Repository.TaskRepository;
import com.example.SpringProject.Repository.UserRepository;
import com.example.SpringProject.entity.Branch;
import com.example.SpringProject.entity.TaskEntity;
import com.example.SpringProject.entity.UserEntity;
import com.example.SpringProject.mapper.TaskMapper;

import jakarta.mail.MessagingException;

@Service
@Transactional
public class TaskService {

	private final TaskRepository taskRepository;
	private final UserRepository userRepository;

	private EmailNotificationService emailNotification;

	@Autowired
	public TaskService(TaskRepository taskRepository, UserRepository userRepository,
			EmailNotificationService emailNotification) {
		this.taskRepository = taskRepository;
		this.userRepository = userRepository;

		this.emailNotification = emailNotification;
	}

	// manager stats
	public Map<String, Object> RequestorStats(Long id) {
		Map<String, Object> stats = new HashMap<>();

		// Fetch total tasks created by the manager using their ID
		long totalTasksCreatedByRequester = taskRepository.countByCreatorId(id);
		stats.put("totalTasksCreatedByRequester", totalTasksCreatedByRequester);

		// Fetch tasks grouped by status for the given manager
		List<Object[]> statusCounts = taskRepository.countTaskByRequester(id);
		Map<String, Long> taskStatusCounts = new HashMap<>();
		for (Object[] statusCount : statusCounts) {
			String status = (String) statusCount[0];
			Long count = (Long) statusCount[1];
			taskStatusCounts.put(status != null ? status : "Unassigned", count);
		}
		stats.put("taskStatusCounts", taskStatusCounts);

		return stats;
	}

	public Map<String, Object> ManagerStats(Long id) {
		Map<String, Object> stats = new HashMap<>();

		// Fetch total tasks created by the manager using their ID
		long total_tasks = taskRepository.allTasks();
		stats.put("totalTasks", total_tasks);

		// Fetch tasks grouped by status for the given manager
		List<Object[]> statusCounts = taskRepository.countTasksByStatusforManager(id);
		Map<String, Long> taskStatusCounts = new HashMap<>();
		for (Object[] statusCount : statusCounts) {
			String status = (String) statusCount[0];
			Long count = (Long) statusCount[1];
			taskStatusCounts.put(status != null ? status : "Unassigned", count);
		}
		stats.put("taskStatusCounts", taskStatusCounts);

		return stats;
	}

	// employee stats

	public Map<String, Object> EmployeeStats(Long id) {
		Map<String, Object> stats = new HashMap<>();

		// Fetch total tasks created by the manager using their ID
		long totalTasksAssignedtoEmployee = taskRepository.countByAssignedId(id);
		stats.put("totalTasksAssigned", totalTasksAssignedtoEmployee);

		// Fetch tasks grouped by status for the given manager
		List<Object[]> statusCounts = taskRepository.countTasksByStatusForEmployee(id);
		Map<String, Long> taskStatusCounts = new HashMap<>();
		for (Object[] statusCount : statusCounts) {
			String status = (String) statusCount[0];
			Long count = (Long) statusCount[1];
			taskStatusCounts.put(status, count);
		}
		stats.put("taskStatusCounts", taskStatusCounts);

		return stats;
	}

	public TaskEntity assignTask(Long taskId, Long userId, Long managerId) throws MessagingException {
		// Find the task by ID
		TaskEntity task = taskRepository.findById(taskId)
				.orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));

		if (userId != null) {
			UserEntity user = userRepository.findById(userId)
					.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

			task.setAssignee(user);
			String assigneeName = user.getFirstname() + " " + user.getMiddlename();
			task.setStatus("Assigned");

			UserEntity manager = null;
			manager = userRepository.findById(managerId)
					.orElseThrow(() -> new RuntimeException("Manager not found with ID: " + managerId));

			System.out.println(manager);
			emailNotification.sendTaskAssignedEmail(user.getEmail(), task.getTitle(), manager.getUsername(),
					assigneeName);

		} else {
			task.setAssignee(null);
			task.setStatus("Pending");
		}

		if (managerId != null) {
			// Set the manager's ID if provided
			UserEntity manager = userRepository.findById(managerId)
					.orElseThrow(() -> new RuntimeException("Manager not found with ID: " + managerId));

			task.setManager(manager); // Assuming `TaskEntity` has a manager field
		} else {
			task.setManager(null);
		}

		// Save the task after assignment
		return taskRepository.save(task);
	}

	// Create new Task
	public CustomResponse<TaskEntity> createTask(TaskDTO taskDto) {
		// Find the creator by creatorId
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
		UserEntity creator = userRepository.findById(taskDto.getCreatorId())
				.orElseThrow(() -> new RuntimeException("Creator user not found"));

		Branch requestorBranch = creator.getBranchid();

		// Create a new task entity and set values from DTO
		TaskEntity task = new TaskEntity();
		task.setTitle(taskDto.getTitle());
		task.setDescription(taskDto.getDescription());
		task.setPriority(taskDto.getPriority());
		task.setStatus(taskDto.getStatus());
		LocalDate deadline = LocalDate.parse(taskDto.getDeadline(), formatter);
		task.setDeadline(deadline);
		task.setCreator(creator); // Set the creator based on the ID passed
		task.setAssignee(null); // Assignee is optional (you can handle it as per your requirements)
		// Save the task entity to the database

		task.setBranchid(requestorBranch);
		TaskEntity savedTask = taskRepository.save(task);
		return new CustomResponse<>("Task created successfully", savedTask);
	}

	// Update a task
	public TaskEntity updateTask(Long taskId, TaskEntity taskDetails) {
		// Check if the task exists
		Optional<TaskEntity> existingTaskOptional = taskRepository.findById(taskId);
		if (existingTaskOptional.isPresent()) {
			TaskEntity existingTask = existingTaskOptional.get();

			// Update fields of the existing task
			existingTask.setTitle(taskDetails.getTitle());
			existingTask.setDescription(taskDetails.getDescription());
			existingTask.setStatus(taskDetails.getStatus());
			existingTask.setPriority(taskDetails.getPriority());
			existingTask.setDeadline(taskDetails.getDeadline());
			existingTask.setRemark(taskDetails.getRemark());

			if ("Completed".equalsIgnoreCase(taskDetails.getStatus()) && existingTask.getTaskCompletionDate() == null) {
				existingTask.setTaskCompletionDate(LocalDate.now()); // Set current time as completion date
			}
			TaskEntity updatedTask = taskRepository.save(existingTask);

			if ("Completed".equalsIgnoreCase(updatedTask.getStatus())) {
				if (updatedTask.getCreator() != null) {
					String requesterEmail = updatedTask.getCreator().getEmail();
					String subject = "Task Completed: " + updatedTask.getTitle();
					String body = "Hello,\n\nThe task titled '" + updatedTask.getTitle() + "' has been completed.\n\n"
							+ "Please check the task management system for more details.";

					// Send email notification to the requester
					try {
						emailNotification.sendCustomEmail(requesterEmail, subject, body);
					} catch (MessagingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}

			// Save the updated task
			return updatedTask;
		} else {
			// Task with given ID does not exist
			throw new RuntimeException("Task with id " + taskId + " not found.");
		}
	}

	// Get all tasks
	public List<TaskDTO> getAllTasks() {
		List<TaskEntity> taskEntities = taskRepository.findAll();
		return taskEntities.stream().map(taskEntity -> {
			TaskDTO taskDTO = TaskMapper.mapToTaskDto(taskEntity);
			// Fetch the creator details based on creatorId (if not null)
			Long creatorId = taskDTO.getCreatorId();
			if (creatorId != null) {
				Optional<UserEntity> creator = userRepository.findById(creatorId);
				// Handle creator information
				if (creator.isPresent()) {
					UserEntity user = creator.get();
					Long branchId = (user.getBranchid() != null) ? user.getBranchid().getId() : null; // Handle null
					// branchid
					UserDto creatorDTO = new UserDto(user.getId(), user.getFirstname(), user.getMiddlename(),
							user.getLastname(), user.getPhonenumber(), user.getUsername(), null, null,
							user.getOfficetype(), branchId, null, null, user.getEmail(), null);
					taskDTO.setCreator(creatorDTO);
				} else {
					taskDTO.setCreator(null);
				}
			} else {
				taskDTO.setCreator(null); // If creatorId is null, set creator as null
			}

			// Fetch the assignee details based on assignedUserId (if not null)
			Long assigneeId = taskDTO.getAssignedUserId();
			if (assigneeId != null) {
				Optional<UserEntity> assignee = userRepository.findById(assigneeId);

				// Handle assignee information
				if (assignee.isPresent()) {
					UserEntity user = assignee.get();
					Long branchId = (user.getBranchid() != null) ? user.getBranchid().getId() : null; // Handle null //
																										// branchid
					UserDto assigneeDTO = new UserDto(user.getId(), user.getFirstname(), user.getMiddlename(),
							user.getLastname(), user.getPhonenumber(), user.getUsername(), null, null,
							user.getOfficetype(), branchId, null, null, user.getEmail(), null);
					taskDTO.setAssignee(assigneeDTO);
				} else {
					taskDTO.setAssignee(null);
				}
			} else {
				taskDTO.setAssignee(null); // If assignedUserId is null, set assignee as null
			}
			Long managerId = taskDTO.getManagerId();

			if (managerId != null) {
				Optional<UserEntity> manager = userRepository.findById(managerId);

				if (manager.isPresent()) {
					UserEntity user = manager.get();
					System.out.println("Found manager: " + user.getUsername()); // Log successful retrieval
					Long branchId = (user.getBranchid() != null) ? user.getBranchid().getId() : null;
					UserDto managerDTO = new UserDto(user.getId(), user.getFirstname(), user.getMiddlename(),
							user.getLastname(), user.getPhonenumber(), user.getUsername(), null, null,
							user.getOfficetype(), branchId, null, null, user.getEmail(), null);
					taskDTO.setManager(managerDTO);
				} else {
					System.out.println("No user found for manager ID: " + managerId);
					taskDTO.setManager(null);
				}
			} else {
				System.out.println("Manager ID is null for task ID: " + taskEntity.getId());
				taskDTO.setManager(null);
			}

			return taskDTO;
		}).collect(Collectors.toList());
	}

	// Get a single task by id
	public Optional<TaskEntity> getTaskById(Long id) {
		return taskRepository.findById(id);
	}

	// Delete task by id
	public void deleteTask(Long id) {
		taskRepository.deleteById(id);
	}
}
