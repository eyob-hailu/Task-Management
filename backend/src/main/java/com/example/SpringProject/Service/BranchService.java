package com.example.SpringProject.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringProject.Repository.BranchRepository;
import com.example.SpringProject.entity.Branch;

@Service
public class BranchService {
	@Autowired
	private BranchRepository branchRepository;

//	public Optional<Branch> findById(Long id) {
//        return branchRepository.findById(id);
//    }

	// Get all branches
	public List<Branch> getAllBranches() {
		return branchRepository.findAll();
	}

	// Get a branch by ID
	public Optional<Branch> getBranchById(Long id) {
		return branchRepository.findById(id);
	}

	// Create a new branch (ensure unique values)
	@Transactional
	public Branch createBranch(Branch branch) {

		if (branch.getBranchCode() == null || branch.getBranchCode().equals("")) {
			throw new IllegalArgumentException("Branch code cannot be null or empty.");
		}
		if (branch.getBranchName() == null || branch.getBranchName().equals("")) {
			throw new IllegalArgumentException("Branch name cannot be null or empty.");
		}

		if (branch.getBranchAddress() == null || branch.getBranchAddress().equals("")) {
			throw new IllegalArgumentException("Branch address cannot be null or empty.");
		}

		if (branchRepository.existsByBranchCode(branch.getBranchCode())) {
			throw new IllegalArgumentException("Branch code already exists.");
		}
		if (branchRepository.existsByBranchName(branch.getBranchName())) {
			throw new IllegalArgumentException("Branch name already exists.");
		}
		return branchRepository.save(branch);
	}

	// Update an existing branch (ensure unique values)
	@Transactional
	public Branch updateBranch(Long id, Branch branch) {
		Branch existingBranch = branchRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Branch not found"));

		// Check if branch_code is unique
		if (!existingBranch.getBranchCode().equals(branch.getBranchCode())
				&& branchRepository.existsByBranchCode(branch.getBranchCode())) {
			throw new IllegalArgumentException("Branch code already exists.");
		}

		// Check if branch_name is unique
		if (!existingBranch.getBranchName().equals(branch.getBranchName())
				&& branchRepository.existsByBranchName(branch.getBranchName())) {
			throw new IllegalArgumentException("Branch name already exists.");
		}

		existingBranch.setBranchCode(branch.getBranchCode());
		existingBranch.setBranchName(branch.getBranchName());

		return branchRepository.save(existingBranch);
	}

	// Delete a branch
	public void deleteBranch(Long id) {
		if (!branchRepository.existsById(id)) {
			throw new IllegalArgumentException("Branch not found.");
		}
		branchRepository.deleteById(id);
	}
}
