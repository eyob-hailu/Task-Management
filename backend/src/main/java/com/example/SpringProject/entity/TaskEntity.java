package com.example.SpringProject.entity;

import java.time.LocalDate;

import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Task_MGT")

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class TaskEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String title;
	@Length(max = 2000)
	private String description;
	private String status;
	private String priority;
	@JsonFormat(pattern = "dd-MM-yyyy")
	private LocalDate deadline;
	@Length(max = 2000)
	private String remark;

	@ManyToOne
	@JoinColumn(name = "creator_id") // Foreign key for the creator
	private UserEntity creator;

	@ManyToOne
	@JoinColumn(name = "assignee_id") // Foreign key for the assignee
	private UserEntity assignee;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "manager_id") // Foreign key for the manager
	private UserEntity manager;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "branchid") // Foreign key column
	private Branch branchid;

	@JsonFormat(pattern = "dd-MM-yyyy")
	private LocalDate taskCreationDate;

	@JsonFormat(pattern = "dd-MM-yyyy")
	private LocalDate taskCompletionDate;

	@PrePersist
	protected void onCreate() {
		this.taskCreationDate = LocalDate.now(); // Automatically set the creation date
	}

}
