package com.example.SpringProject.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Dto.UserDto;
import com.example.SpringProject.GlobalExceptionHandler.CustomException;
import com.example.SpringProject.Repository.BranchRepository;
import com.example.SpringProject.Repository.RoleRepository;
import com.example.SpringProject.Repository.UserRepository;
import com.example.SpringProject.entity.Branch;
import com.example.SpringProject.entity.Role;
import com.example.SpringProject.entity.UserEntity;
import com.example.SpringProject.mapper.UserMapper;

@Service
@Transactional
public class UserServiceImplimentation implements UserServiceInterface, UserDetailsService {
	public RoleServiceImplementation roleServiceImplementation;

	private final RoleRepository roleRepository; // Make sure RoleRepository is injected
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final BranchRepository branchRepository;

	@Autowired
	public UserServiceImplimentation(UserRepository userRepository, RoleRepository roleRepository,
			PasswordEncoder passwordEncoder, BranchRepository branchRepository) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.branchRepository = branchRepository;
	}

	@Override
	public List<UserEntity> bulkUploadUsers(MultipartFile file) {
		List<UserEntity> users = new ArrayList<>();

		InputStream inputStream = null;
		try {
			inputStream = file.getInputStream();
		} catch (IOException e) {
			e.printStackTrace();
			throw new RuntimeException("Error reading the file.");
		}

		// Create Workbook instance
		Workbook workbook = null;
		try {
			workbook = new XSSFWorkbook(inputStream);
		} catch (IOException e) {
			e.printStackTrace();
			throw new RuntimeException("Error processing the Excel file.");
		}

		Sheet sheet = workbook.getSheetAt(0);

		// Iterate over each row
		for (int i = 1; i < sheet.getPhysicalNumberOfRows(); i++) { // Start from row 1 to skip header row
			Row row = sheet.getRow(i);

			String username = row.getCell(4).getStringCellValue();
			String email = row.getCell(7).getStringCellValue();

			// Check if username or email already exists
			if (userRepository.existsByUsername(username)) {
				throw new RuntimeException(
						"Username '" + username + "' already taken. Please choose a different username.");
			}

			if (userRepository.existsByEmail(email)) {
				throw new RuntimeException("Email '" + email + "' already taken. Please choose a different email.");
			}

			// Now we can create the user object after ensuring no duplicates
			UserEntity user = new UserEntity();
			user.setFirstname(row.getCell(0).getStringCellValue());
			user.setMiddlename(row.getCell(1).getStringCellValue());
			user.setLastname(row.getCell(2).getStringCellValue());

			DataFormatter formatter = new DataFormatter();
			String phoneNumber = formatter.formatCellValue(row.getCell(3));
			user.setPhonenumber(phoneNumber);

			user.setUsername(username);
			user.setPassword(passwordEncoder.encode(row.getCell(5).getStringCellValue()));
			user.setOfficetype(row.getCell(6).getStringCellValue());
			user.setEmail(email);

			users.add(user);
		}

		try {
			workbook.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return users;
	}

	@Override
	public void saveUsers(List<UserEntity> users) {
		userRepository.saveAll(users);
	}

	@Override
	public List<UserEntity> getUsersWithEmployeeRole() {
		return userRepository.findUsersWithEmployeeRole();
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserEntity userEntity = userRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("Username not found : " + username));
		return new User(userEntity.getUsername(), userEntity.getPassword(),
				mapRolesToAuthorities(userEntity.getRoles()));
	}

	@Override
	public CustomResponse<UserDto> changePassword(Long id, UserDto userDto) {

		UserEntity existingUser = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
		// Validate the old (current) password
		if (userDto.getPassword() == null
				|| !passwordEncoder.matches(userDto.getPassword(), existingUser.getPassword())) {
			return new CustomResponse<>("Current password is incorrect.", null);
		}
		if (userDto.getNewPassword() == null || userDto.getNewPassword().equals("")) {
			return new CustomResponse<>("New password can not be null", null);
		}
		if (passwordEncoder.encode(userDto.getNewPassword()) != null
				&& userDto.getPassword().equals(userDto.getNewPassword())) {
			return new CustomResponse<>("New password cannot be the same as the current password.", null);
		}
		existingUser.setPassword(passwordEncoder.encode(userDto.getNewPassword()));
		UserEntity updatedUser = userRepository.save(existingUser);
		UserDto updatedUserDto = UserMapper.mapToUserDto(updatedUser, null);
		return new CustomResponse<>("Password changed successfully.", updatedUserDto);
	}

	@Override
	public Map<String, Object> Stats() {
		Map<String, Object> stats = new HashMap<>();
		// Total number of users
		long totalUsers = userRepository.count();
		stats.put("totalUsers", totalUsers);
		// Total number of roles
		long totalRoles = roleRepository.count();

		stats.put("totalRoles", totalRoles);

		long usersWithNorole = userRepository.countUsersWithoutRoles();
		stats.put("usersWithNoRole", usersWithNorole);
		// Users per role (using the alternative approach)
		Map<String, Long> usersPerRole = new HashMap<>();
		List<Object[]> roleCounts = userRepository.countUsersByRole();
		for (Object[] roleCount : roleCounts) {
			String roleName = (String) roleCount[0];
			Long count = (Long) roleCount[1];
			usersPerRole.put(roleName, count);
		}
		stats.put("usersPerRole", usersPerRole);
		return stats;
	}

	@Override
	public CustomResponse<UserEntity> createUser(UserDto userDto) {
		if (userRepository.existsByUsername(userDto.getUsername())) {
			throw new CustomException("Username already taken. Please choose a different username.");
		}
		if (userRepository.existsByEmail(userDto.getEmail())) {
			throw new CustomException("Email already Taken. Please choose different email.");
		}
//		Branch branch = branchRepository.findById(userDto.getBranchid()).orElse(null);
		Branch branch = (userDto.getBranchid() != null) ? branchRepository.findById(userDto.getBranchid()).orElse(null)
				: null;

		UserEntity userEntity = UserMapper.mapToUser(userDto, branch);
		userEntity.setPassword(passwordEncoder.encode(userDto.getPassword()));
		userEntity.setBranchid(branch);
		UserEntity savedUser = userRepository.save(userEntity);
		return new CustomResponse<>("User created successfully", savedUser);
	}

	@Override
	public CustomResponse<UserDto> updateUser(Long id, UserDto userDto) {
		UserEntity existingUser = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

		if (userDto.getUsername() != null && !userDto.getUsername().equals(existingUser.getUsername())) {
			if (userRepository.existsByUsername(userDto.getUsername())) {
				return new CustomResponse<>("Username already taken. Please choose a different username.", null);
			}
		}

		if (userDto.getEmail() != null && !userDto.getEmail().equals(existingUser.getEmail())) {
			if (userRepository.existsByEmail(userDto.getEmail())) {
				return new CustomResponse<>("Email already taken. Please choose a different Email.", null);
			}
		}
		if (userDto.getFirstname() != null)
			existingUser.setFirstname(userDto.getFirstname());
		if (userDto.getMiddlename() != null)
			existingUser.setMiddlename(userDto.getMiddlename());
		if (userDto.getLastname() != null)
			existingUser.setLastname(userDto.getLastname());
		if (userDto.getPhonenumber() != null)
			existingUser.setPhonenumber(userDto.getPhonenumber());
		if (userDto.getEmail() != null)
			existingUser.setEmail(userDto.getEmail());
		if (userDto.getUsername() != null)
			existingUser.setUsername(userDto.getUsername());

		if (userDto.getPassword() != null)
			existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
		if (userDto.getOfficetype() != null)
			existingUser.setOfficetype(userDto.getOfficetype());

		if (userDto.getBranchid() != null) {
			Branch branch = branchRepository.findById(userDto.getBranchid())
					.orElseThrow(() -> new RuntimeException("Branch not found with ID: " + userDto.getBranchid()));
			existingUser.setBranchid(branch); // Update the branch in the user entity
		} else {

			existingUser.setBranchid(null);
		}

		UserEntity updatedUser = userRepository.save(existingUser);
		UserDto updatedUserDto = UserMapper.mapToUserDto(updatedUser, updatedUser.getBranchid());

		return new CustomResponse<>("User updated successfully", updatedUserDto);
	}

	@Override
	public List<UserDto> getAllUsers() {
		List<UserEntity> userEntities = userRepository.findAll();

		return userEntities.stream().map(userEntity -> {
			// Fetch the branch for each user if branchId is not null
			Branch branch = null;
			if (userEntity.getBranchid() != null) {
				branch = branchRepository.findById(userEntity.getBranchid().getId()).orElse(null);
			}
			// Map UserEntity to UserDto, including the branch
			return UserMapper.mapToUserDto(userEntity, branch);
		}).collect(Collectors.toList());
	}

	@Override
	public UserDto deleteUser(Long id) {
		UserEntity userEntity = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("UserEntity with id " + id + " does not exist"));
		if (userEntity.getRoles() != null && !userEntity.getRoles().isEmpty()) {
			userEntity.getRoles().clear();
			userRepository.save(userEntity);
		}
		Branch branch = null;
		if (userEntity.getBranchid() != null) {
			branch = branchRepository.findById(userEntity.getBranchid().getId()).orElse(null);
		}
		UserDto userDto = UserMapper.mapToUserDto(userEntity, branch);
		userRepository.deleteById(id);
		return userDto;
	}

	@Override
	public UserDto getUserAccountById(Long id) {
		UserEntity userEntity = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
		userEntity.getRoles();

		Branch branch = null;
		if (userEntity.getBranchid() != null) {
			branch = branchRepository.findById(userEntity.getBranchid().getId()).orElse(null);
		}

		return UserMapper.mapToUserDto(userEntity, branch);
	}

	@Override
	public UserEntity assignRole(Long id, List<Role> roles) {
		List<Role> listRoles = new ArrayList<>();
		for (Role role : roles) {
			listRoles.add(roleRepository.findById(role.getId()).get());
		}
		UserEntity userEntity = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("UserEntity not found with ID: " + id));
		userEntity.setRoles(listRoles);
		return userRepository.save(userEntity);
	}

	private Collection<GrantedAuthority> mapRolesToAuthorities(List<Role> roles) {
		return roles.stream().map(role -> new SimpleGrantedAuthority(role.getRole())).collect(Collectors.toList());
	}
}
