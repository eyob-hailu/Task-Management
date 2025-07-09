package com.example.SpringProject.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import com.example.SpringProject.Dto.RoleDto;
import com.example.SpringProject.Dto.UserDto;
import com.example.SpringProject.entity.Branch;
import com.example.SpringProject.entity.UserEntity;

public class UserMapper {

	public static UserEntity mapToUser(UserDto userDto, Branch branch) {

		UserEntity userEntity = new UserEntity(userDto.getId(), userDto.getFirstname(), userDto.getMiddlename(),
				userDto.getLastname(), userDto.getPhonenumber(), userDto.getUsername(), userDto.getPassword(),
				userDto.getOfficetype(), userDto.getEmail(), userDto.getResettoken(), null, branch, null, null);
		return userEntity;
	}

	public static UserDto mapToUserDto(UserEntity userEntity, Branch branch) {
		Set<RoleDto> roleDtos = userEntity.getRoles().stream().map(RoleMapper::mapToRoleDto)
				.collect(Collectors.toSet());

		// Handle null branchid
		Long branchId = (userEntity.getBranchid() != null) ? userEntity.getBranchid().getId() : null;

		UserDto userDto = new UserDto(userEntity.getId(), userEntity.getFirstname(), userEntity.getMiddlename(),
				userEntity.getLastname(), userEntity.getPhonenumber(), userEntity.getUsername(),
				userEntity.getPassword(), null, userEntity.getOfficetype(), branchId, roleDtos, branch,
				userEntity.getEmail(), userEntity.getResettoken());
		return userDto;
	}

}
