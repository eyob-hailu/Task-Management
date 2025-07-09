package com.example.SpringProject.Controller;

import java.util.List;

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

import com.example.SpringProject.Dto.RoleDto;
import com.example.SpringProject.Service.RoleServiceInterface;

@RestController
@RequestMapping("/api/role")
public class RoleController {
	RoleServiceInterface roleService;

	public RoleController(RoleServiceInterface roleService) {
		this.roleService = roleService;
	}

	// and new role
	@PostMapping
	public ResponseEntity<RoleDto> createRole(@RequestBody RoleDto roleDto) {
		return new ResponseEntity<>(roleService.createRole(roleDto), HttpStatus.CREATED);
	}

	// get all roles
	@GetMapping
	public ResponseEntity<List<RoleDto>> getAllRoles() {
		List<RoleDto> roleDto = roleService.getAllRoles();
		return ResponseEntity.ok(roleDto);
	}

	@GetMapping("/{id}")
	public ResponseEntity<RoleDto> getRoleById(@PathVariable Long id) {
		RoleDto roleDto = roleService.getRoleById(id);
		return ResponseEntity.ok(roleDto);
	}

//update role
	@PutMapping("/{id}")
	public ResponseEntity<RoleDto> updateRole(@PathVariable Long id, @RequestBody RoleDto roleDto) {
		RoleDto updatedRole = roleService.updateRole(id, roleDto);
		return ResponseEntity.ok(updatedRole);
	}

//delete role
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteRole(@PathVariable Long id) {
		roleService.deleteRole(id);
		return ResponseEntity.ok("role deleted successfully!");
	}
}
