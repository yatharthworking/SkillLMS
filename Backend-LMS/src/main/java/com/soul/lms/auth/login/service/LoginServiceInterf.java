package com.soul.lms.auth.login.service;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface LoginServiceInterf
{
	ResponseEntity<Map <String, Object>> login(String username, String password);
	ResponseEntity<Map<String, Object>> generateRefreshToken(String token);
}
