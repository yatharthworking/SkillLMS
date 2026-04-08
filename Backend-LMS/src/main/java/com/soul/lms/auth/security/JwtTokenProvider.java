package com.soul.lms.auth.security;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service("jwtTokenProvider")
public class JwtTokenProvider{
	
	
	@Value("${jwt.expiryTime}")
	private long EXPIRATION_TIME;
	
	private final CustomUserDetailsService userDetailsService;
	private final JwtConfig jwtConfig;
	
	@Autowired
	public JwtTokenProvider(CustomUserDetailsService userDetailsService, JwtConfig jwtConfig){
		super();
		this.userDetailsService = userDetailsService;
		this.jwtConfig          = jwtConfig;
	}
	
	public String generateToken(Authentication authentication){
		try{
			
			User user = (User) authentication.getPrincipal();
			
			return this.generateJWT(user);
			
		}
		catch(Exception e){
			System.out.println("exception " + e.getMessage());
			return null;
		}
	}
	
	public String extractingUserNameToken(String refreshToken){
		try{
			return Jwts.
					parserBuilder()
					.setSigningKey(this.jwtConfig.generateJwtKeyDecryption())
					.build()
					.parseClaimsJws(refreshToken)
					.getBody()
					.getSubject();
		}
		catch(Exception e){
			// Handle invalid refresh token scenarios
			throw new RuntimeException("Invalid refresh token");
		}
	}
	
	
	public String generateNewAccessToken(String refreshToken) throws NoSuchAlgorithmException, InvalidKeySpecException, IOException{
		String username = extractingUserNameToken(refreshToken);
		
		User user = (User) userDetailsService.loadUserByUsername(username);
		
		return this.generateJWT(user);
	}
	
	public String generateJWT(User user) throws NoSuchAlgorithmException, InvalidKeySpecException, IOException{
		
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);
		HashMap <String, Object> claims = new HashMap <>();
		claims.put("username", user.getUsername());
		
		claims.put("roles", user
				.getAuthorities()
				.stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList()));
		return Jwts.builder()
				.setClaims(claims)
				.setSubject(user.getUsername())
				.setIssuedAt(now)
				.setExpiration(expiryDate)
				.signWith(this.jwtConfig.generateJwtKeyEncryption(), SignatureAlgorithm.RS512)
				.compact();
	}
	
	
	public String generateJWTOidc(OidcUser oidcUser) throws NoSuchAlgorithmException, InvalidKeySpecException, IOException{
		
		// Get OIDC user attributes
		String username = oidcUser.getAttribute("email");
		Map <String, Object> claims = new HashMap<>();
		claims.put("username", username);
		claims.put("email", oidcUser.getEmail());
		claims.put("roles", oidcUser
				.getAuthorities()
				.stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList()));
		// Include additional OIDC user attributes as needed
		
		// Set JWT claims
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);
		
		// Generate JWT
		return Jwts.builder()
				.setClaims(claims)
				.setSubject(username)
				.setIssuedAt(now)
				.setExpiration(expiryDate)
				.signWith(this.jwtConfig.generateJwtKeyEncryption(), SignatureAlgorithm.RS512)
				.compact();
	}
	
}
