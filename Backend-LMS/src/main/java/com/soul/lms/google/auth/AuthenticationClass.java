package com.soul.lms.google.auth;



import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.services.calendar.CalendarScopes;
import com.soul.lms.google.configuration.GoogleConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
@Service
public class AuthenticationClass implements AuthorizationInterf {

    
    private final GoogleConfiguration config;

    GoogleClientSecrets clientSecrets;
	
    @Autowired
	public AuthenticationClass(GoogleConfiguration config){
		this.config = config;
	}
	
	@Override
    public String authorize(String redirectURL, GoogleAuthorizationCodeFlow flow, JsonFactory JSON_FACTORY, HttpTransport httpTransport) throws Exception {
       System.err.println("ok11");
        AuthorizationCodeRequestUrl authorizationUrl;
        if (flow == null) {
            GoogleClientSecrets.Details web = new GoogleClientSecrets.Details()
                    .setClientId(config.getClientId())
                    .setClientSecret(config.getClientSecret())
                    .setTokenUri(config.getTokenUri()).set("project_id", config.getProjectId())
                    .set("access_type", "offline")
                    .set("prompt", "consent");

            clientSecrets = new GoogleClientSecrets().setWeb(web);
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            flow = new GoogleAuthorizationCodeFlow.Builder(httpTransport, JSON_FACTORY, clientSecrets,
                    Collections.singleton(CalendarScopes.CALENDAR)).build();
        }
        System.err.println(redirectURL);
        authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectURL);
        System.out.println("cal authorizationUrl->" + authorizationUrl);
        return authorizationUrl.build();
    }


}
