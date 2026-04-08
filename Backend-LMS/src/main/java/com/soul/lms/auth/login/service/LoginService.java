package com.soul.lms.auth.login.service;

import com.google.common.base.Strings;
import com.soul.lms.auth.security.JwtTokenProvider;
import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service("loginService")
public class LoginService implements LoginServiceInterf
{

	private final JwtTokenProvider jwtTokenProvider;
	private final LmsDaoInterf lmsDaoInterf;
	private final AuthenticationManager authenticationManager;
	
	
	@Autowired
	public LoginService(JwtTokenProvider jwtTokenProvider, LmsDaoInterf lmsDaoInterf, AuthenticationManager authenticationManager){
		super();
		this.jwtTokenProvider = jwtTokenProvider;
		this.lmsDaoInterf     = lmsDaoInterf;
		this.authenticationManager = authenticationManager;
	}
	
	//logger
	private final Logger logger = LogManager.getLogger(LoginService.class);
	
	@Override
	public ResponseEntity<Map <String, Object>> login(String username, String password)
	{
		HashMap <String, Object> response = new HashMap<>();
		try{
			
			Optional<UserCredentialsDB> userCredentialsDB = lmsDaoInterf.getUserCredentials(username);
			
			if(userCredentialsDB.isPresent()){
				
				Authentication authentication = authenticationManager.authenticate(
						new UsernamePasswordAuthenticationToken(username, password)
				                                                                  );
				SecurityContextHolder.getContext().setAuthentication(authentication);
				updateUserLastActive(userCredentialsDB.get());
				
				String token = jwtTokenProvider.generateToken(authentication);

				response.put("token", token);

				if(userCredentialsDB.get().getUserInfo().getIsEmailVerified()){
					return ResponseEntity.ok(response);
				}else {
					response.put("message", "Kindly Verify your email");
					return ResponseEntity.status(HttpStatus.NON_AUTHORITATIVE_INFORMATION).body(response);
				}
			}
			else
			{
				response.put("message", "INVALID USERNAME OR PASSWORD");
				
				return ResponseEntity.badRequest().body(response);
			}
		
		}
		
		catch(Exception e){
			
			System.out.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			response.put("message", e.getMessage());
			
			return ResponseEntity.internalServerError().body(response);
			
		}
	}

	private void updateUserLastActive(UserCredentialsDB userCredentialsDB) {
		try {
			UserInfoDB userInfoDB = userCredentialsDB.getUserInfo();
			if (Objects.nonNull(userInfoDB)) {
				userInfoDB.setUpdationTimeStamp(LocalDateTime.now());
				lmsDaoInterf.saveUserInfo(userInfoDB);
			}
		} catch (Exception e) {
			logger.warn("Unable to update user activity timestamp for {}", userCredentialsDB.getUsername(), e);
		}
	}
	
	@Override
	public ResponseEntity<Map<String, Object>> generateRefreshToken(String token)
	{
		HashMap <String, Object> response = new HashMap<>();
		try{
			String newToken = jwtTokenProvider.generateNewAccessToken(token);
			
			if (!Strings.isNullOrEmpty(newToken)) {
				response.put("token", newToken);
				
				return ResponseEntity.ok(response);
			} else {
				return new ResponseEntity <>(HttpStatus.UNPROCESSABLE_ENTITY);
			}
		}
		
		catch(Exception e)
		{
			System.out.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			response.put("message", e.getMessage());
			
			return ResponseEntity.internalServerError().body(response);
		}
	}
}
