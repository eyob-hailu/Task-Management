package com.example.SpringProject.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailNotificationService {

	@Autowired
	private JavaMailSender javaMailSender;

	public void sendTaskAssignedEmail(String toEmail, String taskName, String manager, String assignee)
			throws MessagingException {
		String subject = "New Task Assigned";
		String taskLink = "http://localhost:4200/"; // Construct the task URL dynamically
		String body = "Hello " + assignee + ",\n\n" + "You have been assigned a new task with the title: " + taskName
				+ ".\n" + "Assigned by: " + manager + ".\n" + "\n"
				+ "Please check the task management system for more details." + "\nYou can view the task details here: "
				+ taskLink + "\n\n" + "";

		MimeMessage message = javaMailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true);

		helper.setFrom("your-email@gmail.com");
		helper.setTo(toEmail);
		helper.setSubject(subject);
		helper.setText(body);

		javaMailSender.send(message);
	}

	public void sendCustomEmail(String toEmail, String subject, String body) throws MessagingException {
		MimeMessage message = javaMailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true);

		helper.setFrom("your-email@gmail.com");
		helper.setTo(toEmail);
		helper.setSubject(subject);
		helper.setText(body);

		javaMailSender.send(message);
	}
}
