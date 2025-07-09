package com.example.SpringProject.Dto;

import java.util.Set;

import com.example.SpringProject.entity.Branch;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

	private Long id;
	private String firstname;
	private String middlename;
	private String lastname;
	private String phonenumber;
	private String username;
	private String password;
	private String newPassword;
	private String officetype;
	private Long branchid;
	private Set<RoleDto> roles;
	private Branch branch;
	private String email;
	private String resettoken;
}
