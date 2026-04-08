package com.soul.lms.auth.security;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {
	
	private final AuthAbstract authAbstract;
	private final JwtConfig jwtConfig;

	//constructor
	@Autowired
	public JwtTokenFilter(AuthAbstract authAbstract, JwtConfig jwtConfig)
	{
		super();
		this.authAbstract = authAbstract;
		this.jwtConfig    = jwtConfig;
	}

	//logger
	private final Logger logger = LogManager.getLogger(JwtTokenFilter.class);

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
			throws ServletException, IOException {

		String token = extractToken(request);

		if (!Strings.isNullOrEmpty(token)) {
			try {
				
				Jws <Claims> claims = Jwts.parserBuilder()
						.setSigningKey(this.jwtConfig.generateJwtKeyDecryption())
						.build()
						.parseClaimsJws(token);

				this.setupAuthentication(claims);

				//setting token in authAbstract
				this.authAbstract.setBearerToken("Bearer " + token);

			} catch (Exception e) {

				//logging exception
				System.err.println("exception " + e.getMessage());
				logger.error(e.fillInStackTrace());

				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			}
		}

		filterChain.doFilter(request, response);
	}
	
	private String extractToken(HttpServletRequest request) {
		String authorizationHeader = request.getHeader("Authorization");

		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			return authorizationHeader.substring(7); // Extract the token excluding "Bearer "
		}
		return null;
	}
	private void setupAuthentication(Jws<Claims> claimsJws) {
		try{
			
			// Extract relevant information from claims
			String username = claimsJws.getBody().getSubject();
			
			
			ObjectMapper objectMapper = new ObjectMapper();
			
			List<String> roles = objectMapper.convertValue(claimsJws.getBody().get("roles"), new TypeReference <>(){
			});
			
			if (username != null && roles != null && !roles.isEmpty()) {
				
				Collection <SimpleGrantedAuthority> authorities = roles.stream().map(SimpleGrantedAuthority::new).toList();
				
				// Create an Authentication object and set it in the SecurityContextHolder
				UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
				SecurityContextHolder.getContext().setAuthentication(authenticationToken);
			}
				 else {
					System.err.println("Username is null");
				}
		}
			catch (Exception e) {

			logger.error(e.fillInStackTrace());
			System.err.println("Error setting up authentication: " + e.getMessage());

		}
	}

}