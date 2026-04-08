package com.soul.lms.google.controller;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.*;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.EntryPoint;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.soul.lms.google.configuration.GoogleConfiguration;
import com.soul.lms.google.service.EventServiceInterf;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/google")
@CrossOrigin(allowedHeaders = {"Authorization"})
public class RouteController{

	@Autowired//when you have to use reference use @Autowired automatically object will be created
	private GoogleConfiguration config;


	private final EventServiceInterf eventService;
	private final static Log logger = LogFactory.getLog(RouteController.class);
	private static final String APPLICATION_NAME = "LMS";
	protected static HttpTransport httpTransport;
	private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
	private final Environment environment;

	GoogleAuthorizationCodeFlow flow;
	Credential credential;
	GoogleClientSecrets clientSecrets;
	protected static com.google.api.services.calendar.Calendar client;

	@Autowired
	public RouteController(EventServiceInterf eventService, Environment environment) {
		this.eventService = eventService;
		this.environment = environment;
	}

	@GetMapping(value = "/login")
	public RedirectView googleConnectionStatus(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
											   @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
											    HttpServletRequest request) throws Exception {
		System.err.println("coming 1");

		// Generate the authorization URL
		String state = from + ";" + to;
		String redirectUri = config.getRedirectUri() + "google/login";
		String authorizationUrl = this.authorize(redirectUri, state);

		return new RedirectView(authorizationUrl);
	}

	@GetMapping(value = "/login", params = {"code", "state"})
	public ResponseEntity<List<Event>> oauth2Callback(
			@RequestParam(value = "code") String code,
			@RequestParam("state") String state,
			HttpServletRequest request) {

		try {
			// Retrieve from and to from state parameter or session
			String[] stateParams = state.split(";");
			LocalDateTime from = LocalDateTime.parse(stateParams[0]);
			LocalDateTime to = LocalDateTime.parse(stateParams[1]);

			List<Object> ls = eventService.requiredToken(code, config.getRedirectUri() + "google/login", flow, credential, httpTransport, APPLICATION_NAME, JSON_FACTORY, client);
			Calendar.Events events = (Calendar.Events) ls.get(1);
			this.credential= (Credential) ls.get(0);

			List <Event> message = eventService.showEvents(events, from, to);

			return ResponseEntity.status(HttpStatus.OK).body(message);
		}

		catch(Exception e){
			logger.warn("Exception while handling OAuth2 callback (" + e.getMessage() + ")."
					+ " Redirecting to google connection status page.");
			System.err.println("Exception while handling OAuth2 callback (" + e.getMessage() + ")."
					+ " Redirecting to google connection status page.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}


	}


	@GetMapping(value = "/createEventConference")
	public RedirectView googleConnectionStatus1(HttpServletRequest request, @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME,pattern = "dd-MM-yyyy HH:mm") LocalDateTime from,
												@RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME,pattern = "dd-MM-yyyy HH:mm") LocalDateTime to, @RequestParam("eventName") String eventName) throws Exception{
		System.err.println("coming");
		String state = from + ";" + to + ";" + eventName;
		return new RedirectView(this.authorize(config.getRedirectUri() + "google/createEventConference", state));
	}

	@GetMapping(value = "/createEventConference", params = "code")
	public void oauth2CallbackCreateConfEvent(HttpServletResponse response, @RequestParam(value = "code") String code, @RequestParam("state") String state) throws
			IOException{
		try{
			List<Object> ls =  eventService.requiredToken(code, config.getRedirectUri() + "google/createEventConference", flow, credential, httpTransport, APPLICATION_NAME, JSON_FACTORY, client);
			Calendar.Events events = (Calendar.Events) ls.get(1);
			this.credential= (Credential) ls.get(0);

			// Retrieve from and to from state parameter or session
			String[] stateParams = state.split(";");
			LocalDateTime from = LocalDateTime.parse(stateParams[0]);
			LocalDateTime to = LocalDateTime.parse(stateParams[1]);
			String eventName = stateParams[2];

			if (eventService.createEvent(events, from, to, eventName))
			{
				HashMap<String,String> responseMap = new HashMap<>();
				List<Event> eventList = eventService.showEvents(events, from, to);
				eventList.forEach(event -> {

					List<EntryPoint> entryPointList = event.getConferenceData().getEntryPoints();

					Optional<EntryPoint> filteredEntryPoint = entryPointList.stream().filter(entryPoint -> Objects.equals(entryPoint.getEntryPointType().trim().toLowerCase(),"video".trim().toLowerCase())).findFirst();

                    filteredEntryPoint.ifPresent(entryPoint -> responseMap.put("meetingLink", entryPoint.getUri()));

				});

				if(!responseMap.isEmpty()){
					response.getWriter().write(responseMap.toString());

					UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromHttpUrl(environment.getProperty("client.redirect-url") + "createWebinar").queryParam("meetingLink",responseMap.get("meetingLink"));
					response.sendRedirect(uriComponentsBuilder.toUriString());

				}else{

					responseMap.put("message","Error while creating meeting link");
					response.getWriter().write(responseMap.toString());
					response.sendRedirect(environment.getProperty("client.redirect-url") + "createWebinar");
				}

			}

		}
		catch(Exception e){
			System.err.println(e.getMessage());
			logger.warn("Exception in oauth2CallbackCreateEvent present in RouteController "+ e.getMessage());

		}

	}

//	@GetMapping(value = "/createEvent")
//	public RedirectView googleConnectionStatus2(HttpServletRequest request) throws Exception{
//		System.err.println("coming");
//
//		return new RedirectView(this.authorize(config.getRedirectUri() + "google/createEvent"));
//	}


	@GetMapping(value = "/createEvent", params = "code")
	public ResponseEntity <Boolean> oauth2CallbackCreateEvent(@RequestParam(value = "code") String code) throws  IOException {

		try{
			List<Object> ls =  eventService.requiredToken(code, config.getRedirectUri() + "google/createEvent", flow, credential, httpTransport, APPLICATION_NAME, JSON_FACTORY, client);
			Calendar.Events events = (Calendar.Events) ls.get(1);
			this.credential= (Credential) ls.get(0);
			Event event = new Event().setSummary("Meeting with Google Meet Link 1").setDescription("Let's have a meeting with Google Meet.").setStart(new EventDateTime().setDateTime(new DateTime(new Date()))).setEnd(new EventDateTime().setDateTime(new DateTime(new Date(System.currentTimeMillis() + 3600000))));
			events.insert("primary", event).execute();
			return ResponseEntity.status(HttpStatus.OK).body(Boolean.TRUE);

		}
		catch(Exception e){
			System.err.println(e.getMessage());
			logger.warn("Exception in oauth2CallbackCreateEvent present in RouteController "+ e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Boolean.FALSE);

		}

	}

	private String authorize(String redirectURL, String state) throws Exception{
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
			flow          = new GoogleAuthorizationCodeFlow.Builder(httpTransport, JSON_FACTORY, clientSecrets,
					Collections.singleton(CalendarScopes.CALENDAR)).build();
		}
		System.err.println(redirectURL);
		authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectURL).setState(state);
		System.out.println("cal authorizationUrl->" + authorizationUrl);
		return authorizationUrl.build();
	}

	@GetMapping(value = "/logout")
	public ResponseEntity<Boolean> logout() {
		try {
			if (credential != null && credential.getAccessToken() != null) {
				String accessToken = credential.getAccessToken();
				HttpRequestFactory factory = httpTransport.createRequestFactory();
				GenericUrl url = new GenericUrl("https://accounts.google.com/o/oauth2/revoke?token=" + accessToken);
				HttpRequest request = factory.buildGetRequest(url);
				HttpResponse response = request.execute();
				if (response.getStatusCode() == 200) {
					System.out.println("Successfully logged out.");
					credential = null;
					flow = null;
					return ResponseEntity.status(HttpStatus.OK).body(Boolean.TRUE);
				} else {
					System.out.println("Failed to log out.");
					return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Boolean.FALSE);
				}
			} else {
				System.out.println("User is already logged out.");
				return ResponseEntity.status(HttpStatus.OK).body(Boolean.TRUE);
			}
		} catch (Exception e) {
			System.err.println(e.getMessage());
			logger.warn("Exception in logout present in RouteController " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Boolean.FALSE);
		}
	}

}