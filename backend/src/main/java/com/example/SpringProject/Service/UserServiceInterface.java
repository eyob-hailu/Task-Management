package com.example.SpringProject.Service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Dto.UserDto;
import com.example.SpringProject.entity.Role;
import com.example.SpringProject.entity.UserEntity;

public interface UserServiceInterface {
	CustomResponse<UserEntity> createUser(UserDto userDto);

	UserEntity assignRole(Long id, List<Role> roles);

	UserDto getUserAccountById(Long id);

	CustomResponse<UserDto> updateUser(Long id, UserDto userDto);

	CustomResponse<UserDto> changePassword(Long id, UserDto userDto);

	List<UserDto> getAllUsers();

	public UserDto deleteUser(Long id);

	Map<String, Object> Stats();

	List<UserEntity> getUsersWithEmployeeRole();

	List<UserEntity> bulkUploadUsers(MultipartFile file);

	void saveUsers(List<UserEntity> users);

}
