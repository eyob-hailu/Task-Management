package com.example.SpringProject.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.example.SpringProject.Service.BranchService;
import com.example.SpringProject.entity.Branch;

@RestController
@RequestMapping("/api/admin/branch")
public class BranchController {

	@Autowired
	private BranchService branchService;

	// Get all branches
	@GetMapping
	public ResponseEntity<CustomResponse<List<Branch>>> getAllBranches() {
		List<Branch> branches = branchService.getAllBranches();
		return ResponseEntity.ok(new CustomResponse<>("Branches retrieved successfully", branches));
	}

	// Get a branch by ID
	@GetMapping("/{id}")
	public ResponseEntity<CustomResponse<Branch>> getBranchById(@PathVariable Long id) {
		return branchService.getBranchById(id)
				.map(branch -> ResponseEntity.ok(new CustomResponse<>("Branch retrieved successfully", branch)))
				.orElse(ResponseEntity.status(404).body(new CustomResponse<>("Branch not found", null)));
	}

	// Create a new branch
	@PostMapping
	public ResponseEntity<CustomResponse<Branch>> createBranch(@RequestBody Branch branch) {
		try {
			Branch createdBranch = branchService.createBranch(branch);
			return ResponseEntity.ok(new CustomResponse<>("Branch created successfully", createdBranch));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new CustomResponse<>(e.getMessage(), null));
		}
	}

	// Update an existing branch
	@PutMapping("/{id}")
	public ResponseEntity<CustomResponse<Branch>> updateBranch(@PathVariable Long id, @RequestBody Branch branch) {
		try {
			Branch updatedBranch = branchService.updateBranch(id, branch);
			return ResponseEntity.ok(new CustomResponse<>("Branch updated successfully", updatedBranch));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new CustomResponse<>(e.getMessage(), null));
		}
	}

	// Delete a branch
	@DeleteMapping("/{id}")
	public ResponseEntity<CustomResponse<Void>> deleteBranch(@PathVariable Long id) {
		try {
			branchService.deleteBranch(id);
			return ResponseEntity.ok(new CustomResponse<>("Branch deleted successfully", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(404).body(new CustomResponse<>(e.getMessage(), null));
		}
	}
}
