package com.soul.lms.auth.security;

import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import com.soul.lms.model.jparepository.registrationrepository.UserCredentialsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service("customUserDetailsService")
public class CustomUserDetailsService implements UserDetailsService {
	
	
	private final UserCredentialsRepository userRepository;
	
	@Autowired
	public CustomUserDetailsService(UserCredentialsRepository userRepository){
		super();
		this.userRepository = userRepository;
	}
	
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserCredentialsDB user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
		
		// Convert the RolesDB objects to SimpleGrantedAuthority objects
		List <GrantedAuthority> authorities = user.getUserInfo().getRoles().stream()
				.map(role -> new SimpleGrantedAuthority(role.getRoleMaster().getRoleMasterName()))
				.collect(Collectors.toList());
		
		return new User(user.getUsername(), user.getPassword(), authorities);
	}
	
}

