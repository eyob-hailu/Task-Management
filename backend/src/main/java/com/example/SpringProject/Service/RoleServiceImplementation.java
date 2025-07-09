package com.example.SpringProject.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SpringProject.Dto.RoleDto;
import com.example.SpringProject.Repository.RoleRepository;
import com.example.SpringProject.entity.Role;
import com.example.SpringProject.mapper.RoleMapper;

@Service
public class RoleServiceImplementation implements RoleServiceInterface {

	private RoleRepository roleRepository;

	public RoleServiceImplementation(RoleRepository roleRepository) {

		this.roleRepository = roleRepository;
	}

	@Override
	public RoleDto createRole(RoleDto roleDto) {
		if (roleRepository.existsByRole(roleDto.getRole())) {
			throw new RuntimeException("Role with the name " + roleDto.getRole() + " already exists.");
		}
		Role role = RoleMapper.mapToRole(roleDto);
		Role savedRole = roleRepository.save(role);
		return RoleMapper.mapToRoleDto(savedRole);
	}

	@Override
	public RoleDto getRoleById(Long id) {
		Role existingRole = roleRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

		return RoleMapper.mapToRoleDto(existingRole);
	}

	@Override
	public RoleDto updateRole(Long id, RoleDto roleDto) {
		Role existingRole = roleRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

		// Update fields from RoleDto
		existingRole.setRole(roleDto.getRole());

		// Save the updated Role entity
		Role updatedRole = roleRepository.save(existingRole);

		// Convert the updated Role entity to a RoleDto
		return RoleMapper.mapToRoleDto(updatedRole);
	}

	@Override
	public List<RoleDto> getAllRoles() {
		List<Role> roles = roleRepository.findAll();

		return roles.stream().map(role -> RoleMapper.mapToRoleDto(role)).collect(Collectors.toList());
	}

	@Override
	public RoleDto deleteRole(Long id) {
		Role role = roleRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("role with id " + id + " does not exist"));

		RoleDto roleDto = RoleMapper.mapToRoleDto(role);

		roleRepository.deleteById(id);
		return roleDto;

	}

}
