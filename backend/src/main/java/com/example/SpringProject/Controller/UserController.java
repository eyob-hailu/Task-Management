package com.example.SpringProject.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Dto.UserDto;
import com.example.SpringProject.Service.AuthenticationService;
import com.example.SpringProject.Service.UserServiceInterface;
import com.example.SpringProject.entity.Role;
import com.example.SpringProject.entity.UserEntity;

@RestController
@RequestMapping("/api")
public class UserController {
	UserServiceInterface userService;
	private final AuthenticationService authenticationService;

	@Autowired
	public UserController(UserServiceInterface userService, AuthenticationService authenticationService) {
		this.userService = userService;
		this.authenticationService = authenticationService;
	}

	@PostMapping("/admin/bulk-upload")
	public ResponseEntity<Map<String, String>> bulkUploadUsers(@RequestParam("file") MultipartFile file)
			throws IOException {
		List<UserEntity> users = userService.bulkUploadUsers(file);

		userService.saveUsers(users);

		Map<String, String> response = new HashMap<>();
		response.put("message", "Users successfully uploaded and saved.");
		return ResponseEntity.ok(response);
	}

	@GetMapping("/manager/employees")
	public CustomResponse<List<UserEntity>> getUsersWithEmployeeRole() {
		List<UserEntity> users = userService.getUsersWithEmployeeRole();
		if (users.isEmpty()) {
			return new CustomResponse<>("No employees found", null);
		}
		return new CustomResponse<>("Employees retrieved successfully", users);
	}

	@PostMapping("/login")
	public ResponseEntity<CustomResponse<?>> login(@RequestBody UserDto userDto) {
		try {
			Map<String, Object> authData = authenticationService.authenticateUser(userDto);
			CustomResponse<Map<String, Object>> response = new CustomResponse<>("Login successful", authData);
			return ResponseEntity.ok(response);
		} catch (BadCredentialsException e) {
			CustomResponse<String> response = new CustomResponse<>("Invalid username or password", null);
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
		} catch (Exception e) {
			System.err.println("Error during authentication: " + e.getMessage());
			CustomResponse<String> response = new CustomResponse<>("An error occurred during login", null);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@GetMapping("/admin/stats")
	public Map<String, Object> getStats() {
		return userService.Stats();
	}

	@PostMapping("/admin/register")
	public ResponseEntity<CustomResponse<?>> createUser(@RequestBody UserDto userDto) {
		try {
			CustomResponse<UserEntity> customResponse = userService.createUser(userDto);
			return new ResponseEntity<>(customResponse, HttpStatus.CREATED); // Success response
		} catch (RuntimeException e) {
			CustomResponse<String> errorResponse = new CustomResponse<>(e.getMessage(), null);
			return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST); // Error response
		}
	}

	@PutMapping("/admin/updateuser/{id}")
	public ResponseEntity<CustomResponse<UserDto>> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
		CustomResponse<UserDto> customResponse = userService.updateUser(id, userDto);

		// If the customResponse has an actual error message, we return BAD_REQUEST
		if (customResponse.getMessage() != null && customResponse.getMessage()
				.contains("Username already taken. Please choose a different username.")) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customResponse);
		}

		if (customResponse.getMessage() != null
				&& customResponse.getMessage().contains("Email already taken. Please choose a different Email.")) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customResponse);
		}
		return ResponseEntity.ok(customResponse);
	}

	// change password
	@PutMapping("/changepassword/{id}")
	public ResponseEntity<CustomResponse<UserDto>> changePassword(@PathVariable Long id, @RequestBody UserDto userDto) {
		CustomResponse<UserDto> response = userService.changePassword(id, userDto);
		if (response.getMessage().equals("Password changed successfully.")) {
			return new ResponseEntity<>(response, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/admin/getusers")
	public ResponseEntity<List<UserDto>> getAllUsers() {
		List<UserDto> userDto = userService.getAllUsers();
		return ResponseEntity.ok(userDto);
	}

	@GetMapping("/admin/getuser/{id}")
	public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
		UserDto userDto = userService.getUserAccountById(id);
		return ResponseEntity.ok(userDto);
	}

	@DeleteMapping("/admin/deleteuser/{id}")
	public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
		Map<String, String> response = new HashMap<>();
		response.put("message", "User deleted successfully!");
		return ResponseEntity.ok(response);
	}

	@PutMapping("/admin/assignroles/{user_id}")
	public UserEntity assignRoles(@PathVariable Long user_id, @RequestBody List<Role> roles) {
		return userService.assignRole(user_id, roles);
	}
}
