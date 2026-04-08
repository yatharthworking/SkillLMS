package com.soul.lms.google.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Service
public class EventService implements EventServiceInterf{
	private final static Log logger = LogFactory.getLog(EventService.class);

	private static final ZoneId IST_ZONE = ZoneId.of("UTC");


	@Override
	public List <Object> requiredToken(String code, String redirectURL, GoogleAuthorizationCodeFlow flow, Credential credential, HttpTransport httpTransport, String APPLICATION_NAME, JsonFactory JSON_FACTORY, Calendar client) throws IOException{
		System.err.println("inside 1");
		TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectURL).execute();
		credential = flow.createAndStoreCredential(response, "userID");
		client     = new Calendar.Builder(httpTransport, JSON_FACTORY, credential).setApplicationName(APPLICATION_NAME).build();
		System.err.println("inside");
		List <Object> ls = new ArrayList <>();
		ls.add(credential);
		ls.add(client.events());
		return ls;
	}

	@Setter
	private List <Event> events = new ArrayList <>();

	@Override
	public List <Event> showEvents(Calendar.Events events, LocalDateTime from, LocalDateTime to) throws IOException{
		try{
			com.google.api.services.calendar.model.Events eventList;

			// Convert LocalDateTime to Google's DateTime using IST
			DateTime fromDateTime = new DateTime(from.atZone(IST_ZONE).toInstant().toEpochMilli());
			DateTime toDateTime = new DateTime(to.atZone(IST_ZONE).toInstant().toEpochMilli());


			eventList = events.list("primary").setTimeMin(fromDateTime).setTimeMax(toDateTime).execute();
			setEvents(eventList.getItems());
			System.out.println("My:" + eventList.getItems());
			return getEvents();
		}
		catch(Exception e){
			System.err.println(e.getMessage());
			logger.warn("Exception in showEvents present in EventService " + e.getMessage());

			return null;
		}

	}

	@Override
	public Boolean createEvent(Calendar.Events events, LocalDateTime from, LocalDateTime to,String eventName) throws IOException{
		try{

			// Convert LocalDateTime to Google's DateTime using IST
			DateTime fromDateTime = new DateTime(from.atZone(IST_ZONE).toInstant().toEpochMilli());
			DateTime toDateTime = new DateTime(to.atZone(IST_ZONE).toInstant().toEpochMilli());

			Event event = new Event().setSummary(eventName).setDescription("Let's have a meeting with Google Meet.").setStart(new EventDateTime().setDateTime(fromDateTime)).setEnd(new EventDateTime().setDateTime(toDateTime));
                        /* Set other event properties as needed
                         Create the event in Google Calendar */

			// Create conference data
			ConferenceData conferenceData = new ConferenceData();
			CreateConferenceRequest createRequest = new CreateConferenceRequest();
			createRequest.setRequestId(UUID.randomUUID().toString()); // Set your own unique requestId
			createRequest.setConferenceSolutionKey(new ConferenceSolutionKey().setType("hangoutsMeet"));
			conferenceData.setCreateRequest(createRequest);

			// Set conference data for the event
			event.setConferenceData(conferenceData);


			events.insert("primary", event).setConferenceDataVersion(1).execute();

			return Boolean.TRUE;
		}
		catch(Exception e){
			System.err.println(e.getMessage());
			logger.warn("Exception in showEvents present in createEvent " + e.getMessage());

			return Boolean.FALSE;
		}
	}

}