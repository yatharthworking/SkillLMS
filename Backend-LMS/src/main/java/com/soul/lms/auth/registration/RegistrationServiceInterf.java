package com.soul.lms.auth.registration;

import com.soul.lms.model.entity.contactus.ContactUsEntity;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ForgotPasswordEntity;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ResetPasswordEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelonetimepassword.graphqlentity.OneTimePasswordInput;
import com.soul.lms.model.entity.modelregistration.graphqlentity.UserInfoInput;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

public interface RegistrationServiceInterf
{

    // User Details
    ResponseEntity<UserInfoDB> registerUser(UserInfoDB userInfoInput);
    ResponseEntity<Map<String,Object>> generateOtp(OneTimePasswordInput oneTimePasswordInput);
    ResponseEntity<Map<String, Object>> verifyOtp(OneTimePasswordInput oneTimePasswordEntity);
    //UserCredentialsDB registerUserGoogle(OidcUser oidcUser);
    //UserCredentialsDB registerUserGoogle(OidcUser oidcUser);
    ResponseEntity<UserInfoDB> fetchUserDetails(String email);
    ResponseEntity<Map<String, Object>> resetPassword(ResetPasswordEntity resetPasswordEntity);
    ResponseEntity<Map<String, Object>> saveOrUpdateUserDetails(UserInfoDB updateUserDetailsEntity);
    ResponseEntity<Map<String, Object>> forgotPassword(ForgotPasswordEntity forgotPasswordEntity);


    // Help and Support
    ResponseEntity<Map<String, Object>> saveOrUpdateHelpAndSupport(HelpAndSupportEntity helpAndSupportEntity);


    // ContactUs
    ResponseEntity<Map<String, Object>> saveContactUs(ContactUsEntity contactUsEntity);

}
