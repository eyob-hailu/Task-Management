package com.example.SpringProject.config;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtGenerator {
	public String tokenGenerator(Authentication auth) {
		String username = auth.getName();
		Date currentDate = new Date();
		Date jwtExpire = new Date(currentDate.getTime() + SecurityConstants.JWT_EXPIRATION);

		String roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.joining(","));

		String token = Jwts.builder().setSubject(username).claim("roles", roles).setIssuedAt(currentDate)
				.setExpiration(jwtExpire).signWith(SignatureAlgorithm.HS256, SecurityConstants.JWT_SECRET).compact();
		return token;
	}

	public String getUsernameFromJwt(String token) {
		Claims claim = Jwts.parser().setSigningKey(SecurityConstants.JWT_SECRET).parseClaimsJws(token).getBody();

		return claim.getSubject();
	}

	public List<String> getRolesFromJwt(String token) {
		Claims claims = Jwts.parser().setSigningKey(SecurityConstants.JWT_SECRET).parseClaimsJws(token).getBody();

		String roles = claims.get("roles", String.class);
		return Arrays.asList(roles.split(","));
	}

	public boolean validateToken(String token) {
		try {
			Jwts.parser().setSigningKey(SecurityConstants.JWT_SECRET).parseClaimsJws(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			throw new AuthenticationCredentialsNotFoundException("Session Expired or incorrect");
		}
	}
}
