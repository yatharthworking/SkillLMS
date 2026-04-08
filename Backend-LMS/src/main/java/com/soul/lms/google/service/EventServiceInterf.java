package com.soul.lms.google.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;


public interface EventServiceInterf{

	List<Object> requiredToken(String code, String redirectURL, GoogleAuthorizationCodeFlow flow,
									  Credential credential, HttpTransport httpTransport,
									  String APPLICATION_NAME, JsonFactory JSON_FACTORY,
									  com.google.api.services.calendar.Calendar client)
			throws IOException;


	Boolean createEvent(Calendar.Events events, LocalDateTime from, LocalDateTime to,String eventName) throws IOException;

	List <Event> showEvents(Calendar.Events events, LocalDateTime from, LocalDateTime to) throws IOException;

}