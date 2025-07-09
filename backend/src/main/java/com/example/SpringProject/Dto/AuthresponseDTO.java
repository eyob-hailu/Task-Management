package com.example.SpringProject.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthresponseDTO {
	private String accessToken;
	// private String tokenType = "Bearer ";
}