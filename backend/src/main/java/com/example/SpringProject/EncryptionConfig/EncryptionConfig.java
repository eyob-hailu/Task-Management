package com.example.SpringProject.EncryptionConfig;

import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EncryptionConfig {
	@Bean(name = "jasyptStringEncryptor")
	public StringEncryptor stringEncryptor() {
		StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
		String value = System.getenv("SECRET_KEY");
		encryptor.setPassword(value); // Encryption key
		// encryptor.setAlgorithm("PBEWithMD5AndDES"); // Encryption algorithm
		return encryptor;
	}
}
