package com.example.SpringProject.mapper;

import com.example.SpringProject.Dto.TaskDTO;
import com.example.SpringProject.entity.TaskEntity;

public class TaskMapper {
	public static TaskDTO mapToTaskDto(TaskEntity taskEntity) {
		TaskDTO taskDto = new TaskDTO();
		taskDto.setId(taskEntity.getId());
		taskDto.setTitle(taskEntity.getTitle());
		taskDto.setDescription(taskEntity.getDescription());
		taskDto.setPriority(taskEntity.getPriority());
		taskDto.setStatus(taskEntity.getStatus());
		taskDto.setDeadline(taskEntity.getDeadline() != null ? taskEntity.getDeadline().toString() : null);
		taskDto.setRemark(taskEntity.getRemark());
		taskDto.setCreatorId(taskEntity.getCreator().getId());
		taskDto.setAssignedUserId(taskEntity.getAssignee() != null ? taskEntity.getAssignee().getId() : null);
		taskDto.setManagerId(taskEntity.getManager() != null ? taskEntity.getManager().getId() : null);
		taskDto.setBranchid(taskEntity.getBranchid() != null ? taskEntity.getBranchid().getId() : null);

		taskDto.setBranch(taskEntity.getBranchid());
		return taskDto;
	}
}
