package com.example.SpringProject.Service;

import java.util.List;

import com.example.SpringProject.Dto.RoleDto;

public interface RoleServiceInterface {
	RoleDto createRole(RoleDto roleDto);

	RoleDto getRoleById(Long id);

	RoleDto updateRole(Long id, RoleDto roleDto);

	List<RoleDto> getAllRoles();

	public RoleDto deleteRole(Long id);
}
