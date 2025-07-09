package com.example.SpringProject.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "User_Tabel")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class UserEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String firstname;
	private String middlename;
	private String lastname;
	private String phonenumber;

	private String username;
	private String password;
	private String officetype;
	private String email;
	private String resettoken;
	private Long resetTokenExpirationTime;

	@ManyToOne // Many users belong to one branch
	@JoinColumn(name = "branchid") // Foreign key column
	private Branch branchid;

	// private boolean enabled;

	@ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JoinTable(name = "User_Role", joinColumns = {
			@JoinColumn(name = "user_id", referencedColumnName = "id") }, inverseJoinColumns = {
					@JoinColumn(name = "role_id", referencedColumnName = "id") })
	private List<Role> roles;

	@OneToMany(mappedBy = "assignee") // 'assignee' is the field in TaskEntity

	private List<TaskEntity> tasks;

	public UserEntity(Long id, String firstname, String middlename, String lastname, String phonenumber,
			String username, String password, String officetype, Branch branchid) {
		this.id = id;
		this.firstname = firstname;
		this.middlename = middlename;
		this.lastname = lastname;
		this.phonenumber = phonenumber;
		this.username = username;
		this.password = password;
		this.officetype = officetype;
		this.branchid = branchid;
	}
}
