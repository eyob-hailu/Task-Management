package com.example.SpringProject.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.SpringProject.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByRole(String role);

	Boolean existsByRole(String role);

}
