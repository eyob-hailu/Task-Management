package com.example.SpringProject.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.DefaultHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private JwtAuthEntryPoint authEntryPoint;

	@Autowired
	public SecurityConfig(JwtAuthEntryPoint authEntryPoint) {
		this.authEntryPoint = authEntryPoint;
	}

	@Bean
	public HttpFirewall defaultHttpFirewall() {
		return new DefaultHttpFirewall();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.exceptionHandling(handling -> handling.authenticationEntryPoint(authEntryPoint))
				.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(requests -> requests
						.requestMatchers("/api/login", "/api/changepassword/**", "/reset/forgot_password",
								"/reset/reset_password**", "/reset/**")
						.permitAll().requestMatchers("/api/admin/**").hasAuthority("Admin")
						.requestMatchers("/api/manager/getalltasks", "/api/manager/updatetask/**")
						.hasAnyAuthority("Employee", "Manager") // Allow
						// Employee and manager
						.requestMatchers("api/manager/employeestats/**").hasAuthority("Employee")
						.requestMatchers("/api/manager/**").hasAuthority("Manager").requestMatchers("api/requester/**")
						.hasAuthority("Requester").anyRequest().authenticated());
		http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public JWTAuthenticationFilter jwtAuthenticationFilter() {
		return new JWTAuthenticationFilter();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Add allowed origins
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH")); // Allowed HTTP methods
		configuration.setAllowedHeaders(List.of("*")); // Allow all headers
		configuration.setAllowCredentials(true); // Allow cookies/auth headers

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration); // Apply to all endpoints
		return source;
	}
}