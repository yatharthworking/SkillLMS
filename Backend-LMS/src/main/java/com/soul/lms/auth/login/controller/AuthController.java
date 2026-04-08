package com.soul.lms.auth.login.controller;

import com.soul.lms.auth.login.service.LoginServiceInterf;
import com.soul.lms.model.entity.modelregistration.graphqlentity.UserCredentialsInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController
{
	private final LoginServiceInterf loginServiceInterf;
	
	@Autowired
	public AuthController(LoginServiceInterf loginServiceInterf){
		super();
		this.loginServiceInterf = loginServiceInterf;
	}
	
	@GetMapping("/google/signing")
	public RedirectView googleSignIn() {
		return new RedirectView("/soul/oauth2/authorization/google");
	}
	
	@PostMapping("/login")
	public ResponseEntity<Map <String, Object>> login(@RequestBody UserCredentialsInput userCredentialsInput)
	{
		return loginServiceInterf.login(userCredentialsInput.getUsername(), userCredentialsInput.getPassword());
	}

	@PostMapping("/refresh-token")
	public ResponseEntity<Map <String, Object>> refreshToken(@RequestBody String token)
	{
		return loginServiceInterf.generateRefreshToken(token);
	}
}
