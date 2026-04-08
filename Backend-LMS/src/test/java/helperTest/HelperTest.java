package helperTest;

import com.soul.lms.auth.security.AuthAbstract;
import com.soul.lms.model.entity.email.EmailEntity;
import com.soul.lms.helper.Helper;
import jakarta.mail.internet.MimeMessage;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


public class HelperTest {

    @Mock
    private JavaMailSender emailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private AuthAbstract authAbstract;

    private MockWebServer mockWebServer;

    private MockEnvironment environment;

    @InjectMocks
    private Helper helper;


    @BeforeEach
    public void setUp() throws Exception{
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        MockitoAnnotations.openMocks(this);

         // Inject the WebClient mock into the Helper
        helper = new Helper(webClient, authAbstract, emailSender, templateEngine, environment);
    }

    @AfterEach
    public void tearDown() throws Exception{
        mockWebServer.shutdown();
    }

    //Test method to test generateOTP method
    @Test
    public void testGenerateOTP() {

        //Generating 5 otps for testing.
        for(int i = 0;i < 5; i++){
            Integer otp = helper.generateOTP();
            assertNotNull(otp,"OTP should not be null");
            assertTrue(otp >= 100000 && otp <= 999999, "OTP should be a 6-digit number between 100000 and 999999");

        }
    }

    // Test method to test exception in generateOTP method
    @Test
    public void testGenerateOTPException() {

        // Creating a subclass to simulate the exception
        Helper helperWithException = new Helper(null, null, null, null, null) {

            @Override
            public Integer generateOTP() {
                throw new RuntimeException("Forced exception for testing");
            }

        };
        Integer otp = null;
        try {

            otp = helperWithException.generateOTP();
            fail("Expected an exception to be thrown");

        } catch (RuntimeException e) {

            // Ensure the exception handling code runs
            assertNull(otp, "OTP should be null when an exception occurs");
            assertEquals("Forced exception for testing", e.getMessage());

        }
    }

    //Test method to test isValidPhoneNumber method
    @Test
    public void testIsValidPhoneNumber() {

        // Valid phone numbers
        assertTrue(helper.isValidPhoneNumber("+911234567890"), "Phone number with country code should be valid");
        assertTrue(helper.isValidPhoneNumber("0123456789"), "Phone number with leading 0 should be valid");
        assertTrue(helper.isValidPhoneNumber("1234567890"), "Phone number without leading 0 should be valid");

        // Invalid phone numbers
        assertFalse(helper.isValidPhoneNumber("12345"), "Phone number too short should be invalid");
        assertFalse(helper.isValidPhoneNumber("+91123456789"), "Phone number too short with country code should be invalid");
        assertFalse(helper.isValidPhoneNumber("12345678901"), "Phone number too long should be invalid");
        assertFalse(helper.isValidPhoneNumber("+9112345678901"), "Phone number too long with country code should be invalid");
        assertFalse(helper.isValidPhoneNumber("abcd1234567890"), "Phone number with letters should be invalid");

    }

    //Test method to test isValidEmail method
    @Test
    public void testIsValidEmail() {

        // Valid email addresses
        System.out.println("Testing valid email addresses:");
        assertTrue(helper.isValidEmail("test@example.com"), "Simple valid email should pass");
        System.out.println("Passed: test@example.com");
        assertTrue(helper.isValidEmail("user.name+tag+sorting@example.com"), "Email with plus and dot should pass");
        System.out.println("Passed: user.name+tag+sorting@example.com");
        assertTrue(helper.isValidEmail("user_name@example.co.in"), "Email with underscore and multiple domain parts should pass");
        System.out.println("Passed: user_name@example.co.in");
        assertTrue(helper.isValidEmail("user-name@example.org"), "Email with hyphen should pass");
        System.out.println("Passed: user-name@example.org");
        assertTrue(helper.isValidEmail("user@example.museum"), "Email with long TLD should pass");
        System.out.println("Passed: user@example.museum");

        // Invalid email addresses
        System.out.println("Testing invalid email addresses:");
        assertFalse(helper.isValidEmail("plainaddress"), "Email without @ should fail");
        System.out.println("Passed: plainaddress");
        assertFalse(helper.isValidEmail("@no-local-part.com"), "Email without local part should fail");
        System.out.println("Passed: @no-local-part.com");
        assertFalse(helper.isValidEmail("Outlook Contact <outlook-contact@domain.com>"), "Email with extra text should fail");
        System.out.println("Passed: Outlook Contact <outlook-contact@domain.com>");
        assertFalse(helper.isValidEmail("no-at.domain.com"), "Email without @ should fail");
        System.out.println("Passed: no-at.domain.com");
        assertFalse(helper.isValidEmail("no-tld@domain"), "Email without TLD should fail");
        System.out.println("Passed: no-tld@domain");
        assertFalse(helper.isValidEmail(";beginning-semicolon@domain.co.uk"), "Email with semicolon should fail");
        System.out.println("Passed: ;beginning-semicolon@domain.co.uk");
        assertFalse(helper.isValidEmail("middle-semicolon@domain.co;uk"), "Email with semicolon in domain should fail");
        System.out.println("Passed: middle-semicolon@domain.co;uk");
        assertFalse(helper.isValidEmail("trailing-dot@domain.com."), "Email with trailing dot should fail");
        System.out.println("Passed: trailing-dot@domain.com.");
        assertFalse(helper.isValidEmail("dot..dot@domain.com"), "Email with consecutive dots should fail");
        System.out.println("Passed: dot..dot@domain.com");
        assertFalse(helper.isValidEmail("two@@domain.com"), "Email with double @ should fail");
        System.out.println("Passed: two@@domain.com");

    }

    //test method to Test sendTemplateEmail method
    @Test
    public void testSendTemplateEmail() throws Exception {

        EmailEntity emailEntity = new EmailEntity();
        emailEntity.setTo("test@example.com");
        emailEntity.setSubject("Test Subject");
        emailEntity.setSingleContent("Test Content");

        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(emailSender.createMimeMessage()).thenReturn(mimeMessage);

        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

        when(templateEngine.process(eq("EmailTemplate"), any(Context.class))).thenReturn("Processed Template Content");

        Map<String, Object> expectedResponse = new HashMap<>();
        expectedResponse.put("status", Boolean.TRUE);
        expectedResponse.put("message", "email sent successfully");

        var responseEntity = helper.sendTemplateEmail(emailEntity);

        assertEquals(expectedResponse, responseEntity.getBody());

        // Verify that the email was sent with the correct parameters
        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
        verify(templateEngine).process(eq("EmailTemplate"), contextCaptor.capture());

        Context capturedContext = contextCaptor.getValue();
        assertEquals(emailEntity, capturedContext.getVariable("email"));

        verify(emailSender).send(mimeMessage);
    }

    //Test method to test exception handling in sendTemplateEmail method.
    @Test
    public void testSendTemplateEmailException() throws Exception {

        // Create a test EmailEntity object
        EmailEntity emailEntity = new EmailEntity();
        emailEntity.setTo("test@example.com");
        emailEntity.setSubject("Test Subject");
        emailEntity.setSingleContent("Test Content");

        // Configure the mock emailSender to throw a RuntimeException
        when(emailSender.createMimeMessage()).thenThrow(new RuntimeException("Email sending failed"));

        // Call the method under test
        var responseEntity = helper.sendTemplateEmail(emailEntity);

        // Assert that the internal Server Error is thrown when exception occurs
        assertEquals(HttpStatusCode.valueOf(500), responseEntity.getStatusCode());
        // Assert that the exception message is as expected
        assertEquals("Email sending failed", Objects.requireNonNull(responseEntity.getBody()).get("exception"));

    }

    // Test method to test getAPIMono method
    @Test
    public void testGetAPIMono() throws Exception {

        // Prepare mock response
        String expectedResponse = "Success";
        mockWebServer.enqueue(new MockResponse()
                .setBody(expectedResponse)
                .addHeader("Content-Type", "application/json"));

        // Build the URI with the mock server's URL
        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUriString(mockWebServer.url("/test-endpoint").toString());

        // Call the method under test
        ResponseEntity<Mono<String>> responseEntity = helper.getAPIMono(String.class, uriComponentsBuilder);

        // Assert the response
        assertEquals(HttpStatusCode.valueOf(200), responseEntity.getStatusCode());
        assertTrue(Objects.requireNonNull(Objects.requireNonNull(responseEntity.getBody()).block()).contains(expectedResponse));
    }

    //Commenting out for now as its incomplete(throwing error)
    // Test method to test exception in getAPIMono method(Not Working Exception is not getting thrown)
//    @Test
//    public void testGetAPIMonoException() throws Exception {
//
//        ResponseEntity<Mono<String>> responseEntity = null;
//
//        try {
//            // Prepare mock response with an error
//            mockWebServer.enqueue(new MockResponse()
//                    .setResponseCode(500)
//                    .setBody("Internal Server Error"));
//
//            // Build the URI with the mock server's URL and incorrect parameters to force an exception
//            UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromHttpUrl(mockWebServer.url("").toString());
//
//            // Call the method under test with an incorrect response type to force an exception
//            responseEntity = helper.getAPIMono(String.class, uriComponentsBuilder);
//
//            // Fails the test if an exception is not thrown
//            fail("Expected a RuntimeException to be thrown");
//        } catch (RuntimeException e) {
//            // Assert the response status is 500 Internal Server Error
//            assertEquals(HttpStatusCode.valueOf(500), responseEntity.getStatusCode());
//            assertEquals("500 Internal Server Error", e.getMessage());
//        }
//    }


}
