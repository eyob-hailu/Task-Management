package com.example.SpringProject.Service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SpringProject.Dto.UserDto;
import com.example.SpringProject.Repository.UserRepository;
import com.example.SpringProject.config.JwtGenerator;
import com.example.SpringProject.entity.UserEntity;

@Service
public class AuthenticationService {
	private final AuthenticationManager authenticationManager;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtGenerator jwtGenerator;

	@Autowired
	public AuthenticationService(AuthenticationManager authenticationManager, UserRepository userRepository,
			PasswordEncoder passwordEncoder, JwtGenerator jwtGenerator) {
		this.authenticationManager = authenticationManager;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtGenerator = jwtGenerator;
	}

	public Map<String, Object> authenticateUser(UserDto userDto) {
		UserEntity user = userRepository.findByUsername(userDto.getUsername())
				.orElseThrow(() -> new BadCredentialsException("Username is incorrect: " + userDto.getUsername()));
		if (!passwordEncoder.matches(userDto.getPassword(), user.getPassword())) {
			throw new BadCredentialsException("Password is incorrect");
		}
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(userDto.getUsername(), userDto.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(authentication);
		String token = jwtGenerator.tokenGenerator(authentication);
		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("user", user);
		return response;
	}
}