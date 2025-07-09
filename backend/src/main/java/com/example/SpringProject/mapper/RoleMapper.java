package com.example.SpringProject.mapper;

import com.example.SpringProject.Dto.RoleDto;
import com.example.SpringProject.entity.Role;

public class RoleMapper {
	public static Role mapToRole(RoleDto roleDto) {
		Role role = new Role(roleDto.getId(), roleDto.getRole());
		return role;
	}

	public static RoleDto mapToRoleDto(Role role) {
		RoleDto roleDto = new RoleDto(role.getId(), role.getRole());
		return roleDto;
	}
}
