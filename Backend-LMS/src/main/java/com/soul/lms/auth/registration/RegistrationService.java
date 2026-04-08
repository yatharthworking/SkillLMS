package com.soul.lms.auth.registration;

import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import com.soul.lms.model.entity.announcement.AnnouncementReadEntity;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.contactus.ContactUsEntity;
import com.soul.lms.model.entity.modelonetimepassword.enumentity.Medium;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ForgotPasswordEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.Privileges;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.modelonetimepassword.onetimepassworddb.OneTimePasswordEntityDB;
import com.soul.lms.model.entity.modelregistration.enumentity.Provider;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ResetPasswordEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelonetimepassword.graphqlentity.OneTimePasswordInput;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationsDB;
import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.email.EmailEntity;
import com.soul.lms.helper.HelperInterf;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;


@Service("registrationService")
public class RegistrationService implements RegistrationServiceInterf
{
	
	private final LmsDaoInterf lmsDaoInterf;
	private final PasswordEncoder passwordEncoder;
	private final HelperInterf helperInterf;
	
	@Autowired
	public RegistrationService(LmsDaoInterf lmsDaoInterf, PasswordEncoder passwordEncoder, HelperInterf helperInterf){
		super();
		this.lmsDaoInterf = lmsDaoInterf;
		this.passwordEncoder = passwordEncoder;
		this.helperInterf = helperInterf;
	}
	
	
	//logger
	private final Logger logger = LogManager.getLogger(RegistrationService.class);
	
	
	@Override
	public ResponseEntity<UserInfoDB> registerUser(UserInfoDB userInfoInput){
		
		try{
			//checking whether the email already exists or not
			Optional <UserInfoDB> userInfoExists = lmsDaoInterf.getUserInfo(userInfoInput.getEmail());
			
			//if an object is present
			if (userInfoExists.isPresent()) {
				
				//returning bad request
				throw new RuntimeException("UserName Or Password already in use");
			} else {
				UserInfoDB newUser = new UserInfoDB();
				
				newUser.setDob(userInfoInput.getDob());
				if(helperInterf.isValidEmail(userInfoInput.getEmail()))
				{
					newUser.setEmail(userInfoInput.getEmail());
				}
				else
				{
					throw new RuntimeException("INVALID_EMAIL");
					
				}
				newUser.setFullName(userInfoInput.getFullName());
				newUser.setGender(userInfoInput.getGender());
				newUser.setMobileNo(userInfoInput.getMobileNo());
				newUser.setUserSignature(userInfoInput.getUserSignature());
				newUser.setProvider(Provider.LOCAL);
				newUser.setIsMobileVerified(Boolean.FALSE);
				newUser.setIsEmailVerified(Boolean.TRUE);
				newUser.setIsActive(Boolean.TRUE);
				
				if(!Objects.isNull(userInfoInput.getOrganizationsDB())) {
					
					newUser.setOrganizationsDB(userInfoInput.getOrganizationsDB());
				}
				
				//whose who is a column
				newUser.setCreationTimeStamp(LocalDateTime.now());
				newUser.setUpdationTimeStamp(LocalDateTime.now());
				
				//setting credentials
				//creating a new UserCredentialsDB object
				UserCredentialsDB newUserCredentials = new UserCredentialsDB();
				
				//calling current class setCredentials method
				UserCredentialsDB credentialsDB = this.setCredentials(newUserCredentials, userInfoInput.getUserCredentialsDB());
				
				//setting reference
				credentialsDB.setUserInfo(newUser);
				
				//whose who is a column
				newUserCredentials.setCreationTimeStamp(LocalDateTime.now());
				newUserCredentials.setUpdationTimeStamp(LocalDateTime.now());
				
				//setting reference
				newUser.setUserCredentialsDB(newUserCredentials);
				
				//setting roles
				HashSet <RolesDB> newRoles = new HashSet <>();
				
				//using for-each
				userInfoInput.getRoles().forEach(rolesDB -> {
					
					//creating a new RoleDB object
					RolesDB newRole = new RolesDB();
					
					//calling current class setRoles method
					RolesDB rolesDB1 = this.setRoles(newRole, rolesDB);
					
					//checking is rolesDB1 os null or not
					if(!Objects.isNull(rolesDB1))
					{
						//setting parent reference
						rolesDB1.setUserInfo(Set.of(newUser));
						
						//whose who is a column
						newRole.setCreationTimeStamp(LocalDateTime.now());
						newRole.setUpdationTimeStamp(LocalDateTime.now());
						
						newRoles.add(rolesDB1);
					}
					
				});
				
				//setting roles in newUser object
				newUser.setRoles(newRoles);
				
				//calling saveUserInfo method present in lmsDaoInterf for saving userInfo object
				UserInfoDB userInfoDB = lmsDaoInterf.saveUserInfo(newUser);
				
				//checking if userInfoDB is null or not
				if (!Objects.isNull(userInfoDB)) {
					
					String subject = "Get Started with Your New Account!";
					String messageBodyP1 = "Your Registration was successful. We’re excited to have you join our community. Your account is now active, to complete your registration we would recommend to reset your password by going to the profile section in your login";
					String messageBodyP2 = "Your login credentials are below:<br>Email: " + userInfoInput.getEmail() + "<br>Password: " + userInfoInput.getUserCredentialsDB().getPassword();
					String messageBodyP3 = "You can explore our platform and discover all the benefits we offer. If you need any assistance, visit our Help Center or reach out to us directly.";
					EmailEntity emailEntityForRegistration = helperInterf.generalEmailEntity(subject, null, userInfoInput.getEmail().trim(), userInfoInput.getFullName(),null, messageBodyP1, messageBodyP2, messageBodyP3);
					
					helperInterf.sendTemplateEmail(emailEntityForRegistration).getBody();
					
					return ResponseEntity.ok(userInfoDB);
				}
				
				else return new ResponseEntity<>(HttpStatus.UNPROCESSABLE_ENTITY);
			}
		}
		
		catch(Exception e){
			System.out.println("EXCEPTION IN registerUser" + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			throw new RuntimeException(e.getMessage());
		}
	}
	
	//setting role
	private RolesDB setRoles(RolesDB dbRoles, RolesDB jsonRoles)
	{
		try{
			//setting role master
			if (!Objects.isNull(jsonRoles.getRoleMaster())) dbRoles.setRoleMaster(jsonRoles.getRoleMaster());
			
			//checking if privileges is null or empty or not
			if (!Objects.isNull(jsonRoles.getPrivileges()) && !jsonRoles.getPrivileges().isEmpty() && (Objects.equals(jsonRoles.getRoleMaster().getRoleMasterName().trim().toUpperCase(), "ADMIN".trim().toUpperCase()) || Objects.equals(jsonRoles.getRoleMaster().getRoleMasterName().trim().toUpperCase(), "SUPER_ADMIN".trim().toUpperCase()))) {
				
				//extracting privileges from db
				List <Privileges> existingPrivilegesList = dbRoles.getPrivileges();
				
				//using for-each
				jsonRoles.getPrivileges().forEach(privileges -> {
					
					//checking if existingPrivilege is present or not using privilegesId
					Optional <Privileges> existingPrivilege = existingPrivilegesList.stream().filter(privilege -> !Objects.isNull(privileges.getPrivilegesId()) && !Objects.equals(privileges.getPrivilegesId(), privilege.getPrivilegesId())).findFirst();
					
					//if existingPrivilege is present
					if (existingPrivilege.isPresent()) {
						
						//extracting index
						int privilegeIndex = existingPrivilegesList.indexOf(existingPrivilege.get());
						
						//calling current class setPrivileges method
						Privileges privilege = this.setPrivileges(existingPrivilege.get(), privileges);
						
						//setting reference
						privilege.setRolesDB(dbRoles);
						
						//updating a privilege object in a list
						existingPrivilegesList.set(privilegeIndex, privilege);
					} else {
						
						//creating a new Privileges object
						Privileges newPrivileges = new Privileges();
						
						//calling current class setPrivileges method
						Privileges privilege = this.setPrivileges(newPrivileges, privileges);
						
						//setting reference
						privilege.setRolesDB(dbRoles);
						
						//whose who is a column
						privilege.setCreatedBy(privileges.getCreatedBy());
						privilege.setCreationTimeStamp(LocalDateTime.now());
						privilege.setUpdatedBy(privileges.getUpdatedBy());
						privilege.setUpdationTimeStamp(LocalDateTime.now());
						
						//adding an object in list
						existingPrivilegesList.add(newPrivileges);
					}
				});
				
				//setting an updated list
				dbRoles.setPrivileges(existingPrivilegesList);
			}
			
			return dbRoles;
		}
		catch(Exception e)
		{
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return null;
		}
	}
	
	//setting privileges
	private Privileges setPrivileges(Privileges dbPrivileges, Privileges jsonPrivileges){
		
		//setting data-members
		dbPrivileges.setPrivilegesName(jsonPrivileges.getPrivilegesName());
		dbPrivileges.setPrivilegesCode(jsonPrivileges.getPrivilegesCode());
		
		return dbPrivileges;
		
	}
	
	//setting credentials
	private UserCredentialsDB setCredentials(UserCredentialsDB dpCredentials, UserCredentialsDB jsonCredentials)
	{
		if(!Objects.isNull(jsonCredentials.getUsername()) && !jsonCredentials.getUsername().isBlank()) {
			dpCredentials.setUsername(jsonCredentials.getUsername().trim().toLowerCase());
		}

		if(!Objects.isNull(jsonCredentials.getPassword()) && !jsonCredentials.getPassword().isBlank()) {
			dpCredentials.setPassword(passwordEncoder.encode(jsonCredentials.getPassword()));
		}
		
		return dpCredentials;
	}
	
	
	//method to generate OTP
	@Override
	public ResponseEntity<Map<String,Object>> generateOtp(OneTimePasswordInput oneTimePasswordInput) {
		
		// Creating a new HashMap object for the response
		HashMap<String, Object> responseMap = new HashMap<>();
		
		// Creating a new OneTimePasswordEntityDB object
		OneTimePasswordEntityDB oneTimePasswordEntity = new OneTimePasswordEntityDB();
		
		try {
			
			//calling generateOTP method to generate otp
			Integer otp  = helperInterf.generateOTP();
			
			//checking enum
			if(Objects.equals(oneTimePasswordInput.getMedium(), Medium.EMAIL)){
				
				//checking if email is correct or not by calling isValidEmail method present in helperInterf
				boolean isValidIdentifier = helperInterf.isValidEmail(oneTimePasswordInput.getIdentifier());
				
				//if mail is not valid
				if(!isValidIdentifier){
					responseMap.put("message", "Not a Valid Email");
					responseMap.put("status", Boolean.FALSE);
					return ResponseEntity.badRequest().body(responseMap);
				}
				
			}
			//checking enum
			else if(oneTimePasswordInput.getMedium().equals(Medium.MOBILE)){
				
				//checking if mobileNo is correct or not by calling isValidPhoneNumber method present in helperInterf
				boolean isValidIdentifier = helperInterf.isValidPhoneNumber(oneTimePasswordInput.getIdentifier());
				
				//if phoneNumber is not valid
				if(!isValidIdentifier){
					responseMap.put("message", "Not a Valid Mobile Number");
					responseMap.put("status", Boolean.FALSE);
					return ResponseEntity.badRequest().body(responseMap);
				}
				
			} else {
				responseMap.put("message", "Invalid medium specified");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}
			
			//calling getUserInfo method
			Optional<UserInfoDB> user = lmsDaoInterf.getUserInfo(oneTimePasswordInput.getIdentifier());
			
			//checking the condition
			if(user.isPresent()) {
				
				oneTimePasswordEntity.setMedium(oneTimePasswordInput.getMedium());
				oneTimePasswordEntity.setIdentifier(oneTimePasswordInput.getIdentifier());
				oneTimePasswordEntity.setOtp(otp);
				oneTimePasswordEntity.setUserId(user.get());
				oneTimePasswordEntity.setCreationTimeStamp(LocalDateTime.now());
				
				OneTimePasswordEntityDB otpEntity = lmsDaoInterf.saveOtp(oneTimePasswordEntity);
				
				
				if (!Objects.isNull(otpEntity.getOtpId())) {
					if (oneTimePasswordInput.getMedium().toString().trim().equalsIgnoreCase("email")) {
						String subject = "OTP Verification";
						String message = otp + " is the OTP to validate your account information. OTPs are SECRET, DO NOT SHARE this code with anyone.";
						EmailEntity emailEntity = helperInterf.generalEmailEntity(subject, null, oneTimePasswordInput.getIdentifier().trim(), oneTimePasswordInput.getUserName(), null, message, null, null);
						
						return ResponseEntity.ok(helperInterf.sendTemplateEmail(emailEntity).getBody());
						
					} else if (oneTimePasswordInput.getMedium().toString().trim().equalsIgnoreCase("mobile")) {
						String message = otp + " is the OTP to validate your account information. OTPs are SECRET, DO NOT SHARE this code with anyone.";
						
						// MOBILE OTP IMPLEMENTATION
						
						
						responseMap.put("message", "Otp sent to mobile");
						responseMap.put("status", Boolean.TRUE);
						return ResponseEntity.badRequest().body(responseMap);
						
					} else {
						responseMap.put("message", "Unexpected medium specified");
						responseMap.put("status", Boolean.FALSE);
						return ResponseEntity.badRequest().body(responseMap);
					}
				}
				
				responseMap.put("message", "OTP IS NULL");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
				
			}
			else {
				responseMap.put("message", "User does not exist");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.unprocessableEntity().body(responseMap);
			}
			
		} catch (Exception e) {
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			responseMap.put("exception", e.getMessage());
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	
	@Override
	public ResponseEntity<Map<String, Object>> verifyOtp(OneTimePasswordInput oneTimePasswordEntity) {
		
		HashMap<String, Object> responseMap = new HashMap<>();
		
		try{
			Optional<OneTimePasswordEntityDB> otpInfo = lmsDaoInterf.getOtpInfo(oneTimePasswordEntity.getIdentifier());
			
			if( otpInfo.isPresent() && !Objects.isNull(otpInfo.get().getOtpId())){
				if(otpInfo.get().getOtp().equals(oneTimePasswordEntity.getOtp())){
					if(otpInfo.get().getCreationTimeStamp().plusMinutes(3).isAfter(LocalDateTime.now())) {
						
						if(Objects.equals(oneTimePasswordEntity.getMedium(), Medium.EMAIL)) {
							responseMap.put("message", "OTP_VERIFIED");
							responseMap.put("status", Boolean.TRUE);
							return ResponseEntity.ok(responseMap);
						}else {
							responseMap.put("message", "MOBILE_IMPLEMENTATION");
							responseMap.put("status", Boolean.FALSE);
							return ResponseEntity.unprocessableEntity().body(responseMap);
						}
					} else{
						throw new RuntimeException("OTP_EXPIRED");
					}
				}else{
					throw new RuntimeException("WRONG_OTP");
				}
			}else {
				throw new RuntimeException("OTP_INFO_NOT_FOUND");
			}
		} catch (Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			responseMap.put("exception", e.getMessage());
			responseMap.put("status", Boolean.FALSE);
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	
	//Method to fetch userDetails using email
	@Override
	public ResponseEntity<UserInfoDB> fetchUserDetails(String email) {
		// Fetch user information from the database using the provided email
		Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(email);
		
		// Check if the user information is present
		if (userInfo.isPresent()) {
			// Remove user credentials information for security reasons
			userInfo.get().setUserCredentialsDB(null);
			
			if(!Objects.isNull(userInfo.get().getOrganizationsDB())){
				userInfo.get().getOrganizationsDB().setOrganizationMasterId(userInfo.get().getOrganizationsDB().getOrganizationMasterDB().getOrganizationId());
				userInfo.get().getOrganizationsDB().setOrganizationMasterName(userInfo.get().getOrganizationsDB().getOrganizationMasterDB().getOrganizationName());
				userInfo.get().getOrganizationsDB().setBatchDB(null);
			}
			
			
			boolean isStudent = userInfo.get().getRoles().stream().anyMatch(role -> Objects.equals(role.getRoleMaster().getRoleMasterName().trim().toUpperCase(), "STUDENT".trim().toUpperCase()));
			
			// Check if a role is STUDENT
			if(isStudent) {
				
				// Fetch announcement read statuses based on student ID and markAsRead status
				Optional<List<AnnouncementReadEntity>> announcementStatus = lmsDaoInterf.fetchAnnouncementReadByStudentIdAndStatus(userInfo.get().getUserDetailsId(), Boolean.FALSE, LocalDateTime.now().minusDays(15));
				
				// Fetch batch enrollments for the user based on their user ID
				List<BatchStudentEnrollmentsDB> batchStudentEnrollmentsDBList = lmsDaoInterf.fetchStudentBatchEnrollments(userInfo.get().getUserDetailsId()).orElse(Collections.emptyList());
				
				// If batch enrollments are found, set batch ID and batch name in the user information
				if (!batchStudentEnrollmentsDBList.isEmpty()) {
					userInfo.get().setBatchId(batchStudentEnrollmentsDBList.getFirst().getBatchDB().getBatchId());
					userInfo.get().setBatchName(batchStudentEnrollmentsDBList.getFirst().getBatchDB().getBatchName());
				}
				
				// Check if the fetched announcement statuses are present and not empty
				if (announcementStatus.isPresent() && !announcementStatus.get().isEmpty()) {
					
					// Initialize a list to store announcements
					ArrayList<AnnouncementEntity> announcementList = new ArrayList<>();
					
					List<AnnouncementReadEntity> announcementReadEntityList = announcementStatus.get();
					
					// For each announcement read status, fetch the corresponding announcement
					announcementReadEntityList.forEach(announcementsDBS -> {
						Optional<AnnouncementEntity> announcements = lmsDaoInterf.findActiveAnnouncementById(announcementsDBS.getAnnouncementId());
						announcements.ifPresent(announcementList::add);
						
						announcementList.trimToSize();
					});
					
					// If announcements are found, set the total number of announcements in the user information
					if (!announcementList.isEmpty()) {
						userInfo.get().setTotalAnnouncements(announcementList.size());
					}
				}
			}
			
			
			
			// Return the user information with HTTP status 200 (OK)
			return ResponseEntity.ok(userInfo.get());
		}
		
		// Return an error response if the user information is not found
		return ResponseEntity.unprocessableEntity().build();
	}
	
	
	//Method to update userDetails
	@Override
	public ResponseEntity<Map<String, Object>> saveOrUpdateUserDetails(UserInfoDB updateUserDetailsEntity) {
		HashMap<String, Object> responseMap = new HashMap<>();
		
		try {
			if (Objects.isNull(updateUserDetailsEntity)) {
				responseMap.put("message", "INVALID_USER_PAYLOAD");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			String normalizedEmail = Objects.isNull(updateUserDetailsEntity.getEmail()) ? null : updateUserDetailsEntity.getEmail().trim().toLowerCase();
			String mobileNumber = Objects.isNull(updateUserDetailsEntity.getMobileNo()) ? null : String.valueOf(updateUserDetailsEntity.getMobileNo());
			boolean hasPasswordUpdate = !Objects.isNull(updateUserDetailsEntity.getUserCredentialsDB())
					&& !Objects.isNull(updateUserDetailsEntity.getUserCredentialsDB().getPassword())
					&& !updateUserDetailsEntity.getUserCredentialsDB().getPassword().isBlank();
			boolean hasExistingRoleAssignment = !Objects.isNull(updateUserDetailsEntity.getRoles())
					&& updateUserDetailsEntity.getRoles().stream().anyMatch(role -> !Objects.isNull(role.getRolesId()));

			if (Objects.isNull(updateUserDetailsEntity.getFullName()) || updateUserDetailsEntity.getFullName().isBlank() || Objects.isNull(normalizedEmail) || normalizedEmail.isBlank()) {
				responseMap.put("message", "FULL_NAME_AND_EMAIL_REQUIRED");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			if (!helperInterf.isValidEmail(normalizedEmail)) {
				responseMap.put("message", "INVALID_EMAIL");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			if (Objects.isNull(mobileNumber) || mobileNumber.isBlank() || !helperInterf.isValidPhoneNumber(mobileNumber)) {
				responseMap.put("message", "INVALID_MOBILE_NUMBER");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			if (hasPasswordUpdate && updateUserDetailsEntity.getUserCredentialsDB().getPassword().trim().length() < 8) {
				responseMap.put("message", "PASSWORD_POLICY_NOT_MET");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			Optional<UserInfoDB> existingUserByEmail = lmsDaoInterf.getUserInfo(normalizedEmail);

			Optional<UserInfoDB> existingUserById = lmsDaoInterf.getUserInfoById(updateUserDetailsEntity.getUserDetailsId());
			Optional<UserInfoDB> resolvedUserOptional = existingUserById.isPresent()
					? existingUserById
					: (hasExistingRoleAssignment && existingUserByEmail.isPresent() ? existingUserByEmail : Optional.empty());

			Long resolvedUserDetailsId = resolvedUserOptional
					.map(UserInfoDB::getUserDetailsId)
					.orElse(updateUserDetailsEntity.getUserDetailsId());

			if (existingUserByEmail.isPresent() && !Objects.equals(existingUserByEmail.get().getUserDetailsId(), resolvedUserDetailsId)) {
				responseMap.put("message", "EMAIL_ALREADY_EXISTS");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			Optional<UserInfoDB> existingUserByMobile = lmsDaoInterf.getUserInfoByMobileNo(updateUserDetailsEntity.getMobileNo());
			if (existingUserByMobile.isPresent() && !Objects.equals(existingUserByMobile.get().getUserDetailsId(), resolvedUserDetailsId)) {
				responseMap.put("message", "MOBILE_NUMBER_ALREADY_EXISTS");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.badRequest().body(responseMap);
			}

			OrganizationsDB resolvedOrganization = null;
			if (!Objects.isNull(updateUserDetailsEntity.getOrganizationsDB()) && !Objects.isNull(updateUserDetailsEntity.getOrganizationsDB().getOrgId())) {
				Optional<OrganizationsDB> organizationOptional = lmsDaoInterf.findOrganizationsById(updateUserDetailsEntity.getOrganizationsDB().getOrgId());
				if (organizationOptional.isEmpty()) {
					responseMap.put("message", "INVALID_BRANCH");
					responseMap.put("status", Boolean.FALSE);
					return ResponseEntity.badRequest().body(responseMap);
				}
				resolvedOrganization = organizationOptional.get();
			}

			UserInfoDB userInfoDB;
			
			if (resolvedUserOptional.isPresent()) {
				UserInfoDB existingUser = resolvedUserOptional.get();
				
				// Update fields
				existingUser.setFullName(updateUserDetailsEntity.getFullName());
				existingUser.setGender(updateUserDetailsEntity.getGender());
				existingUser.setMobileNo(updateUserDetailsEntity.getMobileNo());
				existingUser.setDob(updateUserDetailsEntity.getDob());
				existingUser.setUserImage(updateUserDetailsEntity.getUserImage());
				existingUser.setEmail(normalizedEmail);
				existingUser.setIsActive(updateUserDetailsEntity.getIsActive());
				existingUser.setUserSignature(updateUserDetailsEntity.getUserSignature());
				existingUser.setIsEmailVerified(updateUserDetailsEntity.getIsEmailVerified());
				existingUser.setIsMobileVerified(updateUserDetailsEntity.getIsMobileVerified());
				existingUser.setUpdationTimeStamp(LocalDateTime.now());
				
				if(!Objects.isNull(resolvedOrganization)) {
					existingUser.setOrganizationsDB(resolvedOrganization);
				}
				
				if(!Objects.isNull(updateUserDetailsEntity.getRoles()) && !updateUserDetailsEntity.getRoles().isEmpty()) {
					
					//extracting roles from db
					Set<RolesDB> rolesDBSet = existingUser.getRoles();
					
					//using for-each
					updateUserDetailsEntity.getRoles().forEach(role -> {
						
						//checking if existingRoles is present or not using rolesId
						Optional<RolesDB> existingRoles = rolesDBSet.stream().filter(role1 -> !Objects.isNull(role.getRolesId()) && Objects.equals(role.getRolesId(), role1.getRolesId())).findFirst();
						
						//if a role is present
						if(existingRoles.isPresent()) {
							
							//removing the object from the set
							rolesDBSet.remove(existingRoles.get());
							
							//removing userInfo
							existingRoles.get().getUserInfo().remove(existingUser);
							
							//calling current class setRoles method
							RolesDB existingRoleSet = this.setRoles(existingRoles.get(), role);
							
							//checking if existingRoleSet is null or not
							if(!Objects.isNull(existingRoleSet)) {
								
								//setting reference
								existingRoleSet.getUserInfo().add(existingUser);
								
								//whose who is a column
								existingRoles.get().setUpdatedBy(updateUserDetailsEntity.getCreatedBy());
								existingRoles.get().setUpdationTimeStamp(LocalDateTime.now());
								
								//adding existingRoles in a list
								rolesDBSet.add(existingRoleSet);
							}
							
						}
						else
						{
							//creating a new RoleDB object
							RolesDB newRole = new RolesDB();
							
							//calling current class setRoles method
							RolesDB rolesDB = this.setRoles(newRole, role);
							
							//checking if existingRoleSet is null or not
							if(!Objects.isNull(rolesDB)) {
								
								//setting reference
								rolesDB.getUserInfo().add(existingUser);
								
								//whose who is a column
								rolesDB.setUpdatedBy(updateUserDetailsEntity.getCreatedBy());
								rolesDB.setUpdationTimeStamp(LocalDateTime.now());
								
								//adding existingRoles in a list
								rolesDBSet.add(rolesDB);
							}
						}
					});
					
					//setting a role set object in userInfoDBOptional
					existingUser.setRoles(rolesDBSet);
					
				}
				
				//checking if userCredentials is null or not
				if(hasPasswordUpdate)
				{
					//extracting userCredentials from DB
					UserCredentialsDB credentialsDB = Objects.isNull(existingUser.getUserCredentialsDB()) ? new UserCredentialsDB() : existingUser.getUserCredentialsDB();
					
					//calling current class setCredentials method
					UserCredentialsDB credentials = this.setCredentials(credentialsDB, updateUserDetailsEntity.getUserCredentialsDB());
					
					//setting reference
					credentials.setUserInfo(existingUser);
					existingUser.setUserCredentialsDB(credentials);
					
				}
				
				userInfoDB = existingUser;
			}
			
			else {
				
				//creating a new UserInfoDB object
				UserInfoDB newUserInfo = new UserInfoDB();

				if (Objects.isNull(updateUserDetailsEntity.getRoles()) || updateUserDetailsEntity.getRoles().isEmpty()) {
					responseMap.put("message", "ROLE_REQUIRED");
					responseMap.put("status", Boolean.FALSE);
					return ResponseEntity.badRequest().body(responseMap);
				}

				if (!hasPasswordUpdate) {
					responseMap.put("message", "PASSWORD_REQUIRED");
					responseMap.put("status", Boolean.FALSE);
					return ResponseEntity.badRequest().body(responseMap);
				}
				
				//setting data members
				newUserInfo.setFullName(updateUserDetailsEntity.getFullName());
				newUserInfo.setGender(updateUserDetailsEntity.getGender());
				newUserInfo.setMobileNo(updateUserDetailsEntity.getMobileNo());
				newUserInfo.setDob(updateUserDetailsEntity.getDob());
				newUserInfo.setUserImage(updateUserDetailsEntity.getUserImage());
				newUserInfo.setEmail(normalizedEmail);
				newUserInfo.setIsActive(updateUserDetailsEntity.getIsActive());
				newUserInfo.setUserSignature(updateUserDetailsEntity.getUserSignature());
				newUserInfo.setIsMobileVerified(Boolean.FALSE);
				newUserInfo.setIsEmailVerified(Boolean.TRUE);
				newUserInfo.setProvider(Provider.LOCAL);
				newUserInfo.setCreationTimeStamp(LocalDateTime.now());
				newUserInfo.setUpdationTimeStamp(LocalDateTime.now());
				
				//checking if organizationDB is null or not
				if(!Objects.isNull(resolvedOrganization)) {
					newUserInfo.setOrganizationsDB(resolvedOrganization);
				}
				
				//checking if rile is null or empty or not
				if(!Objects.isNull(updateUserDetailsEntity.getRoles()) && !updateUserDetailsEntity.getRoles().isEmpty()) {
					
					//creating a new HashSet object
					HashSet<RolesDB> rolesDBS = new HashSet <>();
					
					//using for-each
					updateUserDetailsEntity.getRoles().forEach(role -> {
						
						//creating new RolesDB object
						RolesDB newRoles = new RolesDB();
						
						//calling current class setRoles method
						RolesDB rolesDB = this.setRoles(newRoles, role);
						
						//checking if rolesDB is null or not
						if(!Objects.isNull(rolesDB)) {
							
							//setting reference
							rolesDB.getUserInfo().add(newUserInfo);
							
							//whose who is a column
							newRoles.setCreatedBy(updateUserDetailsEntity.getCreatedBy());
							newRoles.setCreationTimeStamp(LocalDateTime.now());
							newRoles.setUpdatedBy(updateUserDetailsEntity.getCreatedBy());
							newRoles.setUpdationTimeStamp(LocalDateTime.now());
							
							//adding existingRoles in a list
							rolesDBS.add(rolesDB);
							
						}
					});
					
					//setting rolesDBS in a newUserInfo
					newUserInfo.setRoles(rolesDBS);
				}
				
				//checking if userCredentials is null or not
				if(hasPasswordUpdate)
				{
					//creating a new UserCredentialsDB object
					UserCredentialsDB newUserCredential = new UserCredentialsDB();
					
					//calling current class setCredentials method
					UserCredentialsDB credentialsDB = this.setCredentials(newUserCredential, updateUserDetailsEntity.getUserCredentialsDB());
					
					//setting reference
					credentialsDB.setUserInfo(newUserInfo);
					newUserInfo.setUserCredentialsDB(credentialsDB);
				}
				userInfoDB = newUserInfo;
			}
			//calling saveUserInfo method present in lmsDaoInterf
			UserInfoDB updatedUserInfoDB = lmsDaoInterf.saveUserInfo(userInfoDB);
			
			if (updatedUserInfoDB != null) {
				responseMap.put("message", "User details updated successfully");
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("message", "Failed to update user details");
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.internalServerError().body(responseMap);
			}
			
			
			
		} catch (Exception e) {
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			responseMap.put("exception", e.getMessage());
			responseMap.put("status", Boolean.FALSE);
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	
	//Method to reset password
	@Override
	public ResponseEntity<Map<String, Object>> resetPassword(ResetPasswordEntity resetPasswordEntity){
		
		HashMap<String, Object> responseMap = new HashMap<>();
		
		try{
			ResetPasswordEntity newResetPasswordEntity = new ResetPasswordEntity();
			
			newResetPasswordEntity.setOldPassword(resetPasswordEntity.getOldPassword());
			
			Optional<UserCredentialsDB> userCredentialsDB = lmsDaoInterf.getUserCredentials(resetPasswordEntity.getUserName());
			
			if(userCredentialsDB.isPresent()){
				
				if(passwordEncoder.matches(resetPasswordEntity.getOldPassword(),userCredentialsDB.get().getPassword())){
					
					//Checking here if old password given in UI is the same as new password given in UI
					if (Objects.equals(resetPasswordEntity.getOldPassword(),resetPasswordEntity.getNewPassword())) {
						
						responseMap.put("message", "Old Password is same as new Password");
						responseMap.put("status", Boolean.FALSE);
						return ResponseEntity.badRequest().body(responseMap);
					}
					
					UserInfoDB userInfoDB = userCredentialsDB.get().getUserInfo();
					userCredentialsDB.get().setPassword(passwordEncoder.encode(resetPasswordEntity.getNewPassword()));
					userInfoDB.setUserCredentialsDB(userCredentialsDB.get());
					
					UserInfoDB isSave = lmsDaoInterf.saveUserInfo(userInfoDB);
					
					if(isSave != null){
						
						responseMap.put("message","Password Reset Successfully");
						responseMap.put("status", Boolean.TRUE);
						return ResponseEntity.ok(responseMap);
					}
					
				} else{
					
					responseMap.put("message","Wrong Old Password");
					responseMap.put("status", Boolean.FALSE);
					return ResponseEntity.badRequest().body(responseMap);
					
				}
			}
			
			responseMap.put("message", "User not found");
			responseMap.put("status", Boolean.FALSE);
			return ResponseEntity.unprocessableEntity().body(responseMap);
			
		}catch (Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			responseMap.put("exception", e.getMessage());
			responseMap.put("status", Boolean.FALSE);
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
		
	}
	
	
	//Method to forget password
	@Override
	public ResponseEntity<Map<String, Object>> forgotPassword(ForgotPasswordEntity forgotPasswordEntity){
		
		HashMap<String, Object> responseMap = new HashMap<>();
		
		try{
			Optional<UserCredentialsDB> userCredentialsDB = lmsDaoInterf.getUserCredentials(forgotPasswordEntity.getUserName());
			
			if(userCredentialsDB.isPresent()){
				
				UserInfoDB userInfoDB = userCredentialsDB.get().getUserInfo();
				userCredentialsDB.get().setPassword(passwordEncoder.encode(forgotPasswordEntity.getNewPassword()));
				userInfoDB.setUserCredentialsDB(userCredentialsDB.get());
				
				UserInfoDB isSave = lmsDaoInterf.saveUserInfo(userInfoDB);
				
				if(isSave.getUserDetailsId() != null){
					
					responseMap.put("message","Password Reset Successfully");
					responseMap.put("status", Boolean.TRUE);
					return ResponseEntity.ok(responseMap);
				}
			}
			
			responseMap.put("message", "User not found");
			responseMap.put("status", Boolean.FALSE);
			return ResponseEntity.unprocessableEntity().body(responseMap);
			
		}catch (Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			responseMap.put("exception", e.getMessage());
			responseMap.put("status", Boolean.FALSE);
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
		
	}
	
	
	
	@Override
	public ResponseEntity<Map<String, Object>> saveOrUpdateHelpAndSupport(HelpAndSupportEntity helpAndSupportEntity) {
		
		HashMap<String, Object> responseMap = new HashMap<>();
		
		try {
			
			//extracting userInfo using userName
			Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(helpAndSupportEntity.getUserName());
			
			//if user is present
			if(userInfoDB.isPresent()){
				
				//checking if GrievanceId is null or not
                                if(!Objects.isNull(helpAndSupportEntity.getGrievanceId())){
					
					Optional<HelpAndSupportEntity> optionalPresentEntity = lmsDaoInterf.findUnResolvedHelpById(helpAndSupportEntity.getGrievanceId());
					
					Optional<UserInfoDB> complainantInfo = lmsDaoInterf.getUserInfoById(helpAndSupportEntity.getComplainantId());
					
					if(optionalPresentEntity.isPresent() && complainantInfo.isPresent()) {
						
                                                HelpAndSupportEntity presentSupportEntity = optionalPresentEntity.get();
                                                
                                                presentSupportEntity.setUpdatedBy(userInfoDB.get().getUserDetailsId());
                                                presentSupportEntity.setIsResolved(helpAndSupportEntity.getIsResolved());
                                                presentSupportEntity.setAdminReply(helpAndSupportEntity.getAdminReply());
                                                if (Boolean.TRUE.equals(helpAndSupportEntity.getIsResolved())) {
                                                        presentSupportEntity.setIssueStatus("Resolved");
                                                } else if (!Objects.isNull(helpAndSupportEntity.getAdminReply()) && !helpAndSupportEntity.getAdminReply().isBlank()) {
                                                        presentSupportEntity.setIssueStatus("In Progress");
                                                }
                                                
                                                if(presentSupportEntity.getComplainantId().equals(userInfoDB.get().getUserDetailsId())) {
                                                        presentSupportEntity.setComplaintMessage(helpAndSupportEntity.getComplaintMessage());
                                                        presentSupportEntity.setIssueTitle(helpAndSupportEntity.getIssueTitle());
                                                        presentSupportEntity.setIssueCategory(helpAndSupportEntity.getIssueCategory());
                                                        presentSupportEntity.setPriorityLevel(helpAndSupportEntity.getPriorityLevel());
                                                        presentSupportEntity.setAttachmentName(helpAndSupportEntity.getAttachmentName());
                                                        presentSupportEntity.setAttachmentData(helpAndSupportEntity.getAttachmentData());
                                                }
						
						HelpAndSupportEntity responseSaved = lmsDaoInterf.saveHelpAndSupport(presentSupportEntity);
						
						if(!Objects.isNull(responseSaved.getGrievanceId())) {
							
							String resolvedMessage = "We are pleased to inform you that your complaint has been marked as resolved. Our team has thoroughly investigated and addressed the issue you reported. \n\nResolution Feedback: " + helpAndSupportEntity.getAdminReply() + "\n\nWe appreciate your patience and cooperation during this process. If you continue to experience any problems or if there are any additional concerns, please do not hesitate to contact us. Thank you for your understanding and for being a valued member of our community.";
							String subject = "Help and Support - Ticket Resolved";
							EmailEntity emailEntity = helperInterf.generalEmailEntity(subject, null, complainantInfo.get().getEmail().trim(), complainantInfo.get().getFullName(), null, resolvedMessage, null, null);
							
							Map<String, Object> emailResponseMap = helperInterf.sendTemplateEmail(emailEntity).getBody();
							
							if(!Objects.isNull(emailResponseMap) && Boolean.TRUE.equals(emailResponseMap.get("status"))) {
								responseMap.put("message", "updated and email sent");
							}
							else {
								responseMap.put("message", "updated and email not sent");
							}
							responseMap.put("status", Boolean.TRUE);
							return ResponseEntity.ok(responseMap);
						}
						else {
							responseMap.put("message", "grievance not updated");
							responseMap.put("status", Boolean.FALSE);
							return ResponseEntity.badRequest().body(responseMap);
						}
						
					}
					else {
						responseMap.put("message", "either grievanceId not valid or grievance resolved");
						responseMap.put("status", Boolean.FALSE);
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}
				}
				else {
					//calling current class getHelpAndSupportEntity method
					HelpAndSupportEntity newSupportEntity = this.getHelpAndSupportEntity(helpAndSupportEntity, userInfoDB);
					
					//checking if an object is null or not
					if (!Objects.isNull(newSupportEntity)) {
						
						HelpAndSupportEntity responseSaved = lmsDaoInterf.saveHelpAndSupport(newSupportEntity);
						
                                                if (!Objects.isNull(responseSaved.getGrievanceId())) {
                                                        
                                                        String messageHeader = "Sir/Ma'am";
                                                        String subject = "Help and Support - " + responseSaved.getTicketId();
                                                        String issueSummary = Optional.ofNullable(helpAndSupportEntity.getIssueTitle()).filter(title -> !title.isBlank()).orElse(helpAndSupportEntity.getComplaintMessage());
                                                        EmailEntity emailEntity = helperInterf.generalEmailEntity(subject, userInfoDB.get().getEmail().trim(), null, messageHeader, userInfoDB.get().getFullName(), issueSummary, null, null);
							
							//calling current class
							return sendMail(responseMap, emailEntity);
						} else {
							responseMap.put("message", "grievance not saved");
							responseMap.put("status", Boolean.FALSE);
							return ResponseEntity.badRequest().body(responseMap);
						}
					}
					else
					{
						responseMap.put("message", "Something unknown happened");
						responseMap.put("status", Boolean.FALSE);
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}
				}
			}
			
			responseMap.put("message", "User not found");
			responseMap.put("status", Boolean.FALSE);
			return ResponseEntity.unprocessableEntity().body(responseMap);
			
		} catch (Exception e) {
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			responseMap.put("Exception", e.getMessage());
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	//method to getHelpAndSupportEntity
	private HelpAndSupportEntity getHelpAndSupportEntity(HelpAndSupportEntity helpAndSupportEntity, Optional <UserInfoDB> userInfoDB){
		
		//creating a new HelpAndSupportEntity object
		HelpAndSupportEntity newSupportEntity = new HelpAndSupportEntity();
		
		//checking if userInfoDB is present or not
                if(userInfoDB.isPresent()) {
                        newSupportEntity.setComplainantId(userInfoDB.get().getUserDetailsId());
                        newSupportEntity.setComplainantName(userInfoDB.get().getFullName());
                        newSupportEntity.setCreatedBy(userInfoDB.get().getUserDetailsId());
                        newSupportEntity.setComplaintMessage(helpAndSupportEntity.getComplaintMessage());
                        newSupportEntity.setIssueTitle(helpAndSupportEntity.getIssueTitle());
                        newSupportEntity.setIssueCategory(helpAndSupportEntity.getIssueCategory());
                        newSupportEntity.setPriorityLevel(helpAndSupportEntity.getPriorityLevel());
                        newSupportEntity.setAttachmentName(helpAndSupportEntity.getAttachmentName());
                        newSupportEntity.setAttachmentData(helpAndSupportEntity.getAttachmentData());
                        newSupportEntity.setIsResolved(Boolean.FALSE);
                        newSupportEntity.setIssueStatus("Open");
                        newSupportEntity.setTicketId("TKT-" + System.currentTimeMillis());
                        newSupportEntity.setOrganizationsDB(userInfoDB.get().getOrganizationsDB());
                        return newSupportEntity;
                }
		else
		{
			return null;
		}
	}
	
	//method to send mail
	private ResponseEntity<Map <String, Object>> sendMail(HashMap <String, Object> responseMap, EmailEntity emailEntity){
		Map<String, Object> emailResponseMap = helperInterf.sendTemplateEmail(emailEntity).getBody();
		
		if(!Objects.isNull(emailResponseMap) && Boolean.TRUE.equals(emailResponseMap.get("status"))) {
			responseMap.put("message", "saved and email sent");
			responseMap.put("status", Boolean.TRUE);
			return ResponseEntity.ok(responseMap);
		}
		else {
			responseMap.put("message", "saved and email not sent");
			responseMap.put("status", Boolean.FALSE);
			
			return ResponseEntity.unprocessableEntity().body(responseMap);
		}
		
	}
	
	
	@Override
	public ResponseEntity<Map<String, Object>> saveContactUs(ContactUsEntity contactUsEntity) {
		
		HashMap<String, Object> responseMap = new HashMap<>();
		
		try {
			
			Boolean responseSaved = lmsDaoInterf.saveContactUs(contactUsEntity);
			
			if(responseSaved){
				
				String messageHeader = "Sir/Ma'am";
				String subject = "Contact Request: General Inquiry";
				EmailEntity emailEntity = helperInterf.generalEmailEntity(subject, contactUsEntity.getContactByEmail().trim(), null, messageHeader, contactUsEntity.getContactByName(), contactUsEntity.getMessage(), null, null);
				
				return sendMail(responseMap, emailEntity);
			}
			
			responseMap.put("message", "ContactUs not saved");
			responseMap.put("status", Boolean.FALSE);
			return ResponseEntity.badRequest().body(responseMap);
			
		} catch (Exception e) {
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			responseMap.put("Exception", e.getMessage());
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	
}
