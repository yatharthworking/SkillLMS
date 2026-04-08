package com.soul.lms.auth.oidcauth;

import com.soul.lms.model.entity.modelregistration.enumentity.Provider;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import com.soul.lms.model.jparepository.registrationrepository.UserCredentialsRepository;
import com.soul.lms.dao.LmsDaoInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomOidcUserService extends OidcUserService {
	
	private final UserCredentialsRepository userRepository;
	
	private final LmsDaoInterf lmsDaoInterf;
	
	
	@Autowired
	public CustomOidcUserService(UserCredentialsRepository userRepository, LmsDaoInterf lmsDaoInterf){
		super();
		this.userRepository = userRepository;
		
		this.lmsDaoInterf = lmsDaoInterf;
	}
	
	@Override
	public OidcUser loadUser(OidcUserRequest userRequest) {
		OidcUser oidcUser = super.loadUser(userRequest);
		String email = oidcUser.getAttribute("email");
		
		UserCredentialsDB user = userRepository.findByUsername(email).orElseGet(()->{
			
			UserInfoDB newUserThroughOIDC = new UserInfoDB();
			
			
			newUserThroughOIDC.setEmail(oidcUser.getEmail());
			newUserThroughOIDC.setFullName(oidcUser.getFullName());
			newUserThroughOIDC.setProvider(Provider.GOOGLE);
			newUserThroughOIDC.setIsEmailVerified(Boolean.TRUE);
			newUserThroughOIDC.setIsMobileVerified(Boolean.FALSE);
			
			//whose who is a column
			newUserThroughOIDC.setCreationTimeStamp(LocalDateTime.now());
			newUserThroughOIDC.setUpdationTimeStamp(LocalDateTime.now());
			
			//setting credentials
			//creating a new UserCredentialsDB object
			UserCredentialsDB newUserCredentialsThroughOIDC = new UserCredentialsDB();
			
			newUserCredentialsThroughOIDC.setUsername(oidcUser.getEmail());
			newUserCredentialsThroughOIDC.setPassword(UUID.randomUUID().toString());
			newUserCredentialsThroughOIDC.setUserInfo(newUserThroughOIDC);
			
			//whose who is a column
			newUserCredentialsThroughOIDC.setCreationTimeStamp(LocalDateTime.now());
			newUserCredentialsThroughOIDC.setUpdationTimeStamp(LocalDateTime.now());
			
			//setting userCredentials
			newUserThroughOIDC.setUserCredentialsDB(newUserCredentialsThroughOIDC);
			
			//setting roles
			HashSet <RolesDB> newRoles = new HashSet <>();
			
				RolesDB newRole = new RolesDB();
			
			Optional<RoleMaster> roleMaster = lmsDaoInterf.getRoleMasterByCode("STUDENT_MASTER_ROLE_1");
			
		         roleMaster.ifPresent(newRole::setRoleMaster);
				 
				 newRole.setUserInfo(Set.of(newUserThroughOIDC));
				
				//whose who is a column
				newRole.setCreationTimeStamp(LocalDateTime.now());
				newRole.setUpdationTimeStamp(LocalDateTime.now());
				
				newRoles.add(newRole);
				
			
			newUserThroughOIDC.setRoles(newRoles);
			
			UserInfoDB userInfoDB = lmsDaoInterf.saveUserInfo(newUserThroughOIDC);
			
			if (!Objects.isNull(userInfoDB))
				return newUserCredentialsThroughOIDC;
			
			else
				return null;
			
		});
		
		// Convert the RolesDB objects to SimpleGrantedAuthority objects
		List <GrantedAuthority> authorities = user != null ? user.getUserInfo().getRoles().stream().map(role -> new SimpleGrantedAuthority(role.getRoleMaster().getRoleMasterName())).collect(Collectors.toList()) : null;
		
		return new CustomOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), email);
	}
}