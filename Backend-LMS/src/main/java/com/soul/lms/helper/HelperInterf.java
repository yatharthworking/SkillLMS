package com.soul.lms.helper;

import com.soul.lms.model.entity.email.EmailEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;

public interface HelperInterf
{
	Integer generateOTP();
	
	<T> ResponseEntity <Mono <T>> getAPIMono(Class <T> responseType, UriComponentsBuilder uriComponentsBuilder);
	
	<T> ResponseEntity <Flux <T>> getAPIFlux(Class <T> responseType, UriComponentsBuilder uriComponentsBuilder);
	
	<T> ResponseEntity<Mono<String>> postAPIMono(Class <T> requestType, Optional <T> bodyType, UriComponentsBuilder uriComponentsBuilder);
	
	<T> ResponseEntity<Flux<String>> postAPIFlux(Class <T> requestType, Optional <T> bodyType, UriComponentsBuilder uriComponentsBuilder);
	
	Boolean isValidPhoneNumber(String phoneNumber);
	
	Boolean isValidEmail(String email);

	ResponseEntity<Map<String, Object>> sendEmail(EmailEntity email);

	ResponseEntity <Map<String, Object>>  sendTemplateEmail(EmailEntity emailTemplateEntity);

	EmailEntity generalEmailEntity(String subject, String fromEmail, String toEmail, String messageHeader, String messageFooter, String messageBodyP1, String messageBodyP2, String messageBodyP3);
}
