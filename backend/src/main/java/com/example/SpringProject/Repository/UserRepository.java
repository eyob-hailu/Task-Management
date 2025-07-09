package com.example.SpringProject.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.SpringProject.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
	Optional<UserEntity> findByUsername(String username);

	// @Query("SELECT u FROM UserEntity u WHERE u.email = :email")
	Optional<UserEntity> findByEmail(String email);

	@Query("SELECT u FROM UserEntity u WHERE u.resettoken = :resetToken")
	UserEntity findByResettoken(String resetToken);

	Boolean existsByUsername(String username);

	Boolean existsByEmail(String email);

	@Query("SELECT r.role, COUNT(u) FROM UserEntity u JOIN u.roles r GROUP BY r.role")
	List<Object[]> countUsersByRole();

	@Query("SELECT COUNT(u) FROM UserEntity u WHERE u.roles IS EMPTY")
	Long countUsersWithoutRoles();

	@Query("SELECT u FROM UserEntity u JOIN u.roles r WHERE r.role = 'Employee'")
	List<UserEntity> findUsersWithEmployeeRole();
}
