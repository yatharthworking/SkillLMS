package com.soul.lms.auth.oidcauth;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import java.util.Collection;

@Getter
public class CustomOidcUser extends DefaultOidcUser {
	private final String email;
	public CustomOidcUser(Collection<? extends GrantedAuthority> authorities, OidcIdToken idToken, OidcUserInfo userInfo, String email) {
		super(authorities, idToken, userInfo);
		this.email = email;
	}
	
}
