package com.example.SpringProject.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.SpringProject.entity.Branch;

public interface BranchRepository extends JpaRepository<Branch, Long> {

	boolean existsByBranchCode(String branch_code);

	boolean existsByBranchName(String branch_name);

	Optional<Branch> findById(Branch branchid);

}
