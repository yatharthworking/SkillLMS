package com.soul.lms.helper;

import com.google.common.base.Strings;
import com.soul.lms.auth.security.AuthAbstract;
import com.soul.lms.model.entity.email.EmailEntity;
import jakarta.mail.internet.MimeMessage;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service("helper")
public class Helper implements HelperInterf
{
	
	//logger
	private final Logger logger = LogManager.getLogger(Helper.class);
	
	private final WebClient webClient;
	
	private final AuthAbstract authAbstract;

	private final JavaMailSender emailSender;

	private final TemplateEngine templateEngine;

	private final Environment environment;


	//
	@Autowired
	public Helper(WebClient webClient, AuthAbstract authAbstract, JavaMailSender emailSender, TemplateEngine templateEngine, Environment environment){
		super();
		this.webClient        = webClient;
		this.authAbstract     = authAbstract;

		this.emailSender = emailSender;
		this.templateEngine = templateEngine;
        this.environment = environment;
    }
	
	// Method to Generate a random OTP of 6 Digits
	@Override
	public Integer generateOTP() {
		try {
			System.out.println("otp started");
			SecureRandom random = new SecureRandom();
			return random.nextInt(900000) + 100000; // generates a random number between 100000 and 999999
		}
		
		catch (Exception e) {
			System.err.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return null;
			
		}
	}

	
	// Method for Validating Phone Number Using Regex
	@Override
	public Boolean isValidPhoneNumber(String phoneNumber) {
		
		String pattern = "^\\+91\\d{10}|0?\\d{10}$";
		Pattern r = Pattern.compile(pattern);
		Matcher m = r.matcher(phoneNumber);
		
		return m.matches();
		
	}
	
	// Method for Validating Email ID using Regex
	@Override
	public Boolean isValidEmail(String email) {
		
		String regex = "^[A-Za-z0-9]+(?:[._%+-](?![._%+-])[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
		Pattern pattern = Pattern.compile(regex);
		Matcher m = pattern.matcher(email);
		
		return m.matches();
	}
	
	@Override
	public <T> ResponseEntity <Mono <T>> getAPIMono(Class <T> responseType, UriComponentsBuilder uriComponentsBuilder){
		
		Mono <T> response = null;
		
		try{
			
			// Set up headers
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", authAbstract.getBearerToken());
			headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
			
			//building request using webClient, sending request and receiving response
			response = webClient.get().uri(new URI(uriComponentsBuilder.encode().build().toUriString()))
					.headers(httpHeaders -> httpHeaders.addAll(headers))
					.retrieve()
					.bodyToMono(responseType);
			
			return ResponseEntity.ok(response);
		}
		
		catch(Exception e){
			// Logging exception
			System.err.println("Exception: " + e.getMessage());
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			// Returning exception as a response
			return ResponseEntity.internalServerError().body(Objects.requireNonNull(response, e.getMessage()));
		}
	}
	
	@Override
	public <T> ResponseEntity <Flux <T>> getAPIFlux(Class <T> responseType, UriComponentsBuilder uriComponentsBuilder){
		
		Flux <T> response = null;
		
		try{
			
			// Set up headers
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", authAbstract.getBearerToken());
			headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
			
			//building request using webClient, sending request and receiving response
			response = webClient.get().uri(new URI(uriComponentsBuilder.encode().build().toUriString()))
					.headers(httpHeaders -> httpHeaders.addAll(headers))
					.retrieve()
					.bodyToFlux(responseType);
			
			return ResponseEntity.ok(response);
		}
		
		catch(Exception e){
			// Logging exception
			System.err.println("Exception: " + e.getMessage());
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			// Returning exception as a response
			return ResponseEntity.internalServerError().body(Objects.requireNonNull(response, e.getMessage()));
		}
	}
	
	@Override
	public <T> ResponseEntity<Mono<String>> postAPIMono(Class <T> requestType, Optional <T> bodyType, UriComponentsBuilder uriComponentsBuilder){
		
		Mono<String> responseEntity = Mono.empty();
		try{
			
			WebClient.RequestBodySpec requestSpec = this.postAPI(requestType, bodyType, uriComponentsBuilder);
			
			// Add request body if present
			bodyType.ifPresent(jsonBody -> requestSpec.body(BodyInserters.fromValue(jsonBody)));
			
			// Send request and receive response
			responseEntity = requestSpec.retrieve().bodyToMono(String.class); // Block to wait for the response
			
			// Returning response
			return ResponseEntity.ok(responseEntity);
		}
		catch(Exception e){
			// Logging exception
			System.err.println("Exception: " + e.getMessage());
			logger.catching(e);
			logger.error(e);
			
			// Returning exception as a response
			return ResponseEntity.badRequest().body(Objects.requireNonNull(responseEntity, e.getMessage()));
		}
	}
	
	@Override
	public <T> ResponseEntity<Flux<String>> postAPIFlux(Class <T> requestType, Optional <T> bodyType, UriComponentsBuilder uriComponentsBuilder){
		
		Flux<String> responseEntity = Flux.empty();
		try{
			
			WebClient.RequestBodySpec requestSpec = this.postAPI(requestType, bodyType, uriComponentsBuilder);
			
			// Send request and receive response
			responseEntity = requestSpec.retrieve().bodyToFlux(String.class); // Block to wait for the response
			
			// Returning response
			return ResponseEntity.ok(responseEntity);
		}
		catch(Exception e){
			// Logging exception
			System.err.println("Exception: " + e.getMessage());
			logger.catching(e);
			logger.error(e);
			
			// Returning exception as a response
			return ResponseEntity.badRequest().body(Objects.requireNonNull(responseEntity, e.getMessage()));
		}
	}
	
	public <T> WebClient.RequestBodySpec postAPI(Class <T> requestType, Optional <T> bodyType, UriComponentsBuilder uriComponentsBuilder){
		try{
			// Set up headers
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", authAbstract.getBearerToken());
			headers.setContentType(MediaType.APPLICATION_JSON);
			
			// Build the request using webClient
			WebClient.RequestBodySpec requestSpec = webClient.post().uri(new URI(uriComponentsBuilder.encode().build().toUriString())).headers(httpHeaders -> httpHeaders.addAll(headers));
			
			// Add request body if present
			bodyType.ifPresent(jsonBody -> requestSpec.body(BodyInserters.fromValue(jsonBody)));
			
			return requestSpec;
		}
		catch(Exception e)
		{
			System.err.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return null;
		}
	}


	public ResponseEntity <Map<String, Object>> sendEmail(EmailEntity email) {

		HashMap<String, Object> response = new HashMap<>();

		try {

			SimpleMailMessage message = new SimpleMailMessage();
			message.setTo(email.getTo());
			message.setSubject(email.getSubject());
			message.setText(email.getSingleContent());
			emailSender.send(message);

			response.put("status", Boolean.TRUE);
			response.put("message", "email sent successfully");

			return ResponseEntity.ok(response);

		}
		catch (Exception e){

			System.out.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			response.put("exception", e.getMessage());

			// Returning exception as a response
			return ResponseEntity.internalServerError().body(response);

		}
	}


	public ResponseEntity <Map<String, Object>>  sendTemplateEmail(EmailEntity emailTemplateEntity){

		HashMap<String, Object> response = new HashMap<>();

		try{

			Context context = new Context();
			context.setVariable("email", emailTemplateEntity);
			String htmlContent = "";
			if(emailTemplateEntity.getFrom().equalsIgnoreCase(environment.getProperty("spring.mail.username"))){
				htmlContent = templateEngine.process("EmailTemplateForUser", context);
			}else{
				htmlContent = templateEngine.process("EmailTemplateForAdmin", context);
			}

			MimeMessage message = emailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());


			helper.setTo(emailTemplateEntity.getTo());
			helper.setSubject(emailTemplateEntity.getSubject());
			helper.setText(htmlContent, true);
			if(Objects.isNull(emailTemplateEntity.getFrom())) {
				helper.setFrom(Objects.requireNonNull(environment.getProperty("spring.mail.username")));
			}
			else {
				helper.setFrom(emailTemplateEntity.getFrom());
			}

			emailSender.send(message);


			response.put("status", Boolean.TRUE);
			response.put("message", "email sent successfully");

			return ResponseEntity.ok(response);

		}
		catch(Exception e){

			System.out.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			response.put("exception", e.getMessage());

			// Returning exception as a response
			return ResponseEntity.internalServerError().body(response);

		}
	}


	@Override
	public EmailEntity generalEmailEntity(String subject, String fromEmail, String toEmail, String messageHeader, String messageFooter, String messageBodyP1, String messageBodyP2, String messageBodyP3) {

		EmailEntity emailEntity = new EmailEntity();

		if(!Strings.isNullOrEmpty(subject)) {
			emailEntity.setSubject(subject);
		}
		if(Strings.isNullOrEmpty(toEmail)) {
			emailEntity.setTo(Objects.requireNonNull(environment.getProperty("spring.mail.username")));
		} else {
			emailEntity.setTo(toEmail);
		}
		if(Strings.isNullOrEmpty(fromEmail)) {
			emailEntity.setFrom(Objects.requireNonNull(environment.getProperty("spring.mail.username")));
		} else {
			emailEntity.setFrom(fromEmail);
		}
		if(!Strings.isNullOrEmpty(messageHeader)) {
			emailEntity.setMessageHeader(messageHeader);
		}
		if(!Strings.isNullOrEmpty(messageFooter)) {
			emailEntity.setMessageFooter(messageFooter);
		}
		if(!Strings.isNullOrEmpty(messageBodyP1)) {
			emailEntity.setMessageBodyP1(messageBodyP1);
		}
		if(!Strings.isNullOrEmpty(messageBodyP2)) {
			emailEntity.setMessageBodyP2(messageBodyP2);
		}
		if(!Strings.isNullOrEmpty(messageBodyP3)) {
			emailEntity.setMessageBodyP3(messageBodyP3);
		}

		return emailEntity;
	}

	
}
