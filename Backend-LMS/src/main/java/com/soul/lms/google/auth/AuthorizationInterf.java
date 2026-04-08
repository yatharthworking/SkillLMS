package com.soul.lms.google.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;

public interface AuthorizationInterf
{

    public String authorize(String redirectURL, GoogleAuthorizationCodeFlow flow, JsonFactory JSON_FACTORY, HttpTransport httpTransport) throws Exception ;

    }
