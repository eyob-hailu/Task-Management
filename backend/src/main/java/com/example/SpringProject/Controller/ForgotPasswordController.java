package com.example.SpringProject.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringProject.CustomResponse.CustomResponse;
import com.example.SpringProject.Repository.UserRepository;
import com.example.SpringProject.Service.EmailService;
import com.example.SpringProject.entity.UserEntity;

@RestController
@RequestMapping("/reset")
public class ForgotPasswordController {

	public static class ForgotPasswordRequest {
		private String email;

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}
	}

	public static class ResetPasswordRequest {
		private String token;
		private String newPassword;

		// Getters and Setters
		public String getToken() {
			return token;
		}

		public void setToken(String token) {
			this.token = token;
		}

		public String getNewPassword() {
			return newPassword;
		}

		public void setNewPassword(String newPassword) {
			this.newPassword = newPassword;
		}
	}

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private EmailService emailService;

	@PostMapping("/forgot_password")
	public ResponseEntity<CustomResponse<String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
		try {
			String email = request.getEmail().trim();
			System.out.println("Received email: " + email);

			Optional<UserEntity> userOptional = userRepository.findByEmail(email);

			if (userOptional.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CustomResponse<>("Email not found.", null));

			}

			String token = java.util.UUID.randomUUID().toString();
			long tokenExpirationtime = System.currentTimeMillis() + (1 * 60 * 1000);
			UserEntity user = userOptional.get();

			user.setResettoken(token);
			user.setResetTokenExpirationTime(tokenExpirationtime);
			userRepository.save(user);

			String resetLink = "http://localhost:4200/reset-password?token=" + token;
			System.out.println(token);

//			try {
//				emailService.sendPasswordResetEmail(email, resetLink); // Attempt to send email
//			} catch (MailSendException e) {
//				// If MailSendException occurs, return a generic error message to the frontend
//				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//						.body(new CustomResponse<>("Failed to send the reset password email. Please try again.", null));
//			}
//
//			return ResponseEntity.status(HttpStatus.OK)
//					.body(new CustomResponse<>("Password reset link sent successfully.", resetLink));

			try {
				emailService.sendPasswordResetEmail(email, resetLink); // Attempt to send email
			} catch (MailSendException e) {
				// Catch other mail send exceptions
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
						.body(new CustomResponse<>("Failed to send the reset password email. Please try again.", null));
			}

			// Only return success if the email was successfully sent
			return ResponseEntity.status(HttpStatus.OK)
					.body(new CustomResponse<>("Password reset link sent successfully.", resetLink));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new CustomResponse<>("An error occurred. Please try again later.", e.getMessage()));
		}

	}

	// Retrieve user entity by reset token
	@GetMapping("/getToken")
	public UserEntity getResetToken(String token) {
		return userRepository.findByResettoken(token);
	}

	@PostMapping("/reset_password")
	public ResponseEntity<CustomResponse<String>> resetPassword(@RequestParam String token,
			@RequestBody ResetPasswordRequest request) {
		try {
			// Get user by reset token
			UserEntity user = getResetToken(token);

			// Check if user exists

			if (user == null) {
				CustomResponse<String> response = new CustomResponse<>("Invalid or expired reset token.", null);
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
			}
			if (System.currentTimeMillis() > user.getResetTokenExpirationTime()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(new CustomResponse<>("Reset token has expired.", null));
			}

			// Encode the new password
			BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
			String encodedPassword = passwordEncoder.encode(request.getNewPassword());

			// Update the user's password and clear the reset token
			user.setPassword(encodedPassword);
			user.setResettoken(null); // Clear the reset token after successful reset
			user.setResetTokenExpirationTime(null);
			userRepository.save(user);

			// Return a success message with the response
			CustomResponse<String> response = new CustomResponse<>("Password successfully reset.", null);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			// Return an error message if something goes wrong
			CustomResponse<String> response = new CustomResponse<>(
					"An error occurred while resetting the password: " + e.getMessage(), null);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}
}
