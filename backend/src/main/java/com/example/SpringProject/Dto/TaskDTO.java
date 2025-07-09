package com.example.SpringProject.Dto;

import com.example.SpringProject.entity.Branch;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
	private Long id;
	private String title;
	private String description;
	private String priority;
	private String status;
	private String deadline;
	private String remark;
	private Long creatorId;
	private Long assignedUserId;
	private Long managerId;
	private UserDto creator; // Change this field to hold the creator's details
	private UserDto assignee;
	private UserDto manager;
	private Long branchid;
	private Branch branch;
	private String creation;// task creation date
	private String completeion; // task Completion date

	// Getters and Setters for creator
	public UserDto getCreator() {
		return creator;
	}

	public void setCreator(UserDto creator) {
		this.creator = creator;
	}

}
