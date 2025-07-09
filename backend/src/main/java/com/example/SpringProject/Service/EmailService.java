package com.example.SpringProject.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

	@Autowired
	private JavaMailSender emailSender;

	public void sendPasswordResetEmail(String toEmail, String resetLink) throws Exception {
		try {
			MimeMessageHelper messageHelper = new MimeMessageHelper(emailSender.createMimeMessage(), true);
			messageHelper.setFrom("your-email@gmail.com");
			messageHelper.setTo(toEmail);
			messageHelper.setSubject("Password Reset Request");
			messageHelper.setText("Click the following link to reset your password: " + resetLink, true);

			emailSender.send(messageHelper.getMimeMessage());
		} catch (Exception e) {
			e.printStackTrace();
			throw new Exception("Failed to send password reset email. please try again");

		}
	}
}
