package com.soul.lms.dao;

import com.soul.lms.model.entity.contactus.ContactUsEntity;
import com.soul.lms.model.entity.feedback.FeedbackEntity;
import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import com.soul.lms.model.entity.announcement.AnnouncementReadEntity;
import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import com.soul.lms.model.entity.batchrelation.BatchTestRelationEntity;
import com.soul.lms.model.entity.certificate.CertificateMasterDB;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.liveclass.LiveClassEntity;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.liveclass.LiveClassesEntity;
import com.soul.lms.model.entity.modelmasters.CountryMaster;
import com.soul.lms.model.entity.modelmasters.CourseMaster;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import com.soul.lms.model.entity.modelmasters.masterentitydb.*;
import com.soul.lms.model.entity.modelonetimepassword.onetimepassworddb.OneTimePasswordEntityDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.studymaterial.*;
import com.soul.lms.model.entity.studymaterial.quiz.QuizCorrectAnswersDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizQuestionsDB;
import com.soul.lms.model.entity.tests.*;
import com.soul.lms.model.entity.webinar.WebinarAttended;
import com.soul.lms.model.entity.webinar.WebinarEntity;
import com.soul.lms.model.entity.webinar.WebinarInfo;
import com.soul.lms.model.entity.webinar.WebinarRegister;
import com.soul.lms.model.jparepository.announcementrepository.AnnouncementReadRepo;
import com.soul.lms.model.jparepository.announcementrepository.AnnouncementRepo;
import com.soul.lms.model.jparepository.contactusrepository.ContactUsRepo;
import com.soul.lms.model.jparepository.feedbackrepository.FeedbackRepo;
import com.soul.lms.model.jparepository.helpandsupportrepository.HelpAndSupportRepository;
import com.soul.lms.model.jparepository.batchrelationrepository.BatchCourseRelationRepo;
import com.soul.lms.model.jparepository.batchrelationrepository.BatchTestRelationRepo;
import com.soul.lms.model.jparepository.liveclassrepository.LiveClassRepository;
import com.soul.lms.model.jparepository.certificatesrepository.CertificateRepo;
import com.soul.lms.model.jparepository.enrollmentrepository.BatchTutorEnrollmentRepo;
import com.soul.lms.model.jparepository.holidayrepository.HolidayRepo;
import com.soul.lms.model.jparepository.liveclassrepository.LiveClassesRepository;
import com.soul.lms.model.jparepository.mastersrepository.OrganizationsRepo;
import com.soul.lms.model.jparepository.mastersrepository.*;
import com.soul.lms.model.jparepository.onetimepasswordrepository.OneTimePasswordRepo;
import com.soul.lms.model.jparepository.registrationrepository.RolesRepository;
import com.soul.lms.model.jparepository.registrationrepository.UserCredentialsRepository;
import com.soul.lms.model.jparepository.registrationrepository.UserInfoRepository;
import com.soul.lms.model.jparepository.enrollmentrepository.BatchStudentEnrollmentRepo;
import com.soul.lms.model.jparepository.rolemasterrepository.RoleMasterRepo;
import com.soul.lms.model.jparepository.studymaterialsrepository.*;
import com.soul.lms.model.jparepository.testrepository.*;
import com.soul.lms.model.jparepository.webinarrepository.WebinarAttendedRepo;
import com.soul.lms.model.jparepository.webinarrepository.WebinarInfoRepo;
import com.soul.lms.model.jparepository.webinarrepository.WebinarRegisterRepo;
import com.soul.lms.model.jparepository.webinarrepository.WebinarRepo;
import jakarta.persistence.PreRemove;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Repository("lmsDao")
public class LmsDao implements LmsDaoInterf{
	private final UserInfoRepository userRepository;
	
	private final UserCredentialsRepository userCredentialsRepository;
	
	private final OneTimePasswordRepo oneTimePasswordRepo;
	
	private final OrganizationMasterRepo organizationMasterRepo;
	
	private final OrganizationsRepo organizationsRepo;
	
	private final LiveClassRepository liveClassRepository;
	
	private final WebinarRepo webinarRepo;
	
	private final WebinarRegisterRepo webinarRegisterRepo;
	
	private final WebinarInfoRepo webinarInfoRepo;
	
	private final BatchRepo batchRepo;
	
	private final TestRepo testRepo;
	
	private final TestQuestionsRepo testQuestionsRepo;
	
	private final TestAnswersRepo testAnswersRepo;
	
	private final CorrectAnswerRepo correctAnswerRepo;
	
	private final CourseObjectiveTestSubmitRepo courseObjectiveTestSubmitRepo;
	
	private final BatchStudentEnrollmentRepo batchStudentEnrollmentRepo;
	
	private final LibraryMasterRepo libraryMasterRepo;
	
	private final MaterialEnrollmentRepo materialEnrollmentRepo;
	
	private final QuizCorrectAnswerRepo quizCorrectAnswerRepo;
	
	private final ChapterMasterRepo chapterMasterRepo;
	
	private final QuizMasterRepo quizMasterRepo;
	
	private final CompletedChaptersRepo completedChaptersRepo;
	
	private final WebinarAttendedRepo webinarAttendedRepo;
	
	private final CertificateRepo certificateRepo;
	
	private final BatchTutorEnrollmentRepo batchTutorEnrollmentRepo;
	
	private final HelpAndSupportRepository helpAndSupportRepository;
	
	private final AnnouncementRepo announcementRepo;
	
	private final AnnouncementReadRepo announcementReadRepo;
	
	private final HolidayRepo holidayRepo;
	
	private final BatchCourseRelationRepo batchCourseRelationRepo;
	
	private final LiveClassesRepository liveClassesRepository;
	
	private final ContentsDBRepo contentsDBRepo;
	
	private final BatchTestRelationRepo batchTestRelationRepo;
	
	private final CourseMasterRepo courseMasterRepo;
	
	private final RolesRepository rolesRepository;
	
	private final CourseSubjectiveTestSubmitRepo courseSubjectiveTestSubmitRepo;
	
	private final TestStudentRelationRepo testStudentRelationRepo;
	
	private final QuizQuestionMasterRepo quizQuestionMasterRepo;
	
	private final FeedbackRepo feedbackRepo;
	
	private final ContactUsRepo contactUsRepo;
	
	private final CountryMasterRepo countryMasterRepo;
	
	private final RoleMasterRepo roleMasterRepo;
	
	private final SubjectMasterRepo subjectMasterRepo;
	
	@Autowired
	public LmsDao(UserInfoRepository userRepository, UserCredentialsRepository userCredentialsRepository, OneTimePasswordRepo oneTimePasswordRepo, OrganizationMasterRepo organizationMasterRepo, OrganizationsRepo organizationsRepo, LiveClassRepository liveClassRepository, WebinarRepo webinarRepo, WebinarRegisterRepo webinarRegisterRepo, WebinarInfoRepo webinarInfoRepo, BatchRepo batchRepo, TestRepo testRepo, TestQuestionsRepo testQuestionsRepo, TestAnswersRepo testAnswersRepo, CorrectAnswerRepo correctAnswerRepo, CourseObjectiveTestSubmitRepo courseObjectiveTestSubmitRepo, BatchStudentEnrollmentRepo batchStudentEnrollmentRepo, LibraryMasterRepo libraryMasterRepo, MaterialEnrollmentRepo materialEnrollmentRepo, QuizCorrectAnswerRepo quizCorrectAnswerRepo, ChapterMasterRepo chapterMasterRepo, QuizMasterRepo quizMasterRepo, CompletedChaptersRepo completedChaptersRepo, WebinarAttendedRepo webinarAttendedRepo, CertificateRepo certificateRepo, BatchTutorEnrollmentRepo batchTutorEnrollmentRepo, HelpAndSupportRepository helpAndSupportRepository, AnnouncementRepo announcementRepo, AnnouncementReadRepo announcementReadRepo, HolidayRepo holidayRepo, BatchCourseRelationRepo batchCourseRelationRepo, LiveClassesRepository liveClassesRepository, ContentsDBRepo contentsDBRepo, BatchTestRelationRepo batchTestRelationRepo, CourseMasterRepo courseMasterRepo, RolesRepository rolesRepository, CourseSubjectiveTestSubmitRepo courseSubjectiveTestSubmitRepo, TestStudentRelationRepo testStudentRelationRepo, QuizQuestionMasterRepo quizQuestionMasterRepo, FeedbackRepo feedbackRepo, ContactUsRepo contactUsRepo, CountryMasterRepo countryMasterRepo, RoleMasterRepo roleMasterRepo, SubjectMasterRepo subjectMasterRepo){
		this.userRepository                 = userRepository;
		this.userCredentialsRepository      = userCredentialsRepository;
		this.oneTimePasswordRepo            = oneTimePasswordRepo;
		this.organizationMasterRepo         = organizationMasterRepo;
		this.organizationsRepo              = organizationsRepo;
		this.liveClassRepository            = liveClassRepository;
		this.webinarRepo                    = webinarRepo;
		this.webinarRegisterRepo            = webinarRegisterRepo;
		this.webinarInfoRepo                = webinarInfoRepo;
		this.batchRepo                      = batchRepo;
		this.testRepo                       = testRepo;
		this.testQuestionsRepo              = testQuestionsRepo;
		this.testAnswersRepo                = testAnswersRepo;
		this.correctAnswerRepo              = correctAnswerRepo;
		this.courseObjectiveTestSubmitRepo  = courseObjectiveTestSubmitRepo;
		this.batchStudentEnrollmentRepo     = batchStudentEnrollmentRepo;
		this.libraryMasterRepo              = libraryMasterRepo;
		this.materialEnrollmentRepo         = materialEnrollmentRepo;
		this.quizCorrectAnswerRepo          = quizCorrectAnswerRepo;
		this.chapterMasterRepo              = chapterMasterRepo;
		this.quizMasterRepo                 = quizMasterRepo;
		this.completedChaptersRepo          = completedChaptersRepo;
		this.webinarAttendedRepo            = webinarAttendedRepo;
		this.certificateRepo                = certificateRepo;
		this.batchTutorEnrollmentRepo       = batchTutorEnrollmentRepo;
		this.helpAndSupportRepository       = helpAndSupportRepository;
		this.announcementRepo               = announcementRepo;
		this.announcementReadRepo           = announcementReadRepo;
		this.holidayRepo                    = holidayRepo;
		this.batchCourseRelationRepo        = batchCourseRelationRepo;
		this.liveClassesRepository          = liveClassesRepository;
		this.contentsDBRepo                 = contentsDBRepo;
		this.batchTestRelationRepo          = batchTestRelationRepo;
		this.rolesRepository                = rolesRepository;
		this.courseMasterRepo               = courseMasterRepo;
		this.courseSubjectiveTestSubmitRepo = courseSubjectiveTestSubmitRepo;
		this.testStudentRelationRepo        = testStudentRelationRepo;
		this.quizQuestionMasterRepo         = quizQuestionMasterRepo;
		this.feedbackRepo                   = feedbackRepo;
		this.contactUsRepo                  = contactUsRepo;
		this.countryMasterRepo              = countryMasterRepo;
		this.roleMasterRepo                 = roleMasterRepo;
		this.subjectMasterRepo              = subjectMasterRepo;
	}
	
	//logger
	private final Logger logger = LogManager.getLogger(LmsDao.class);
	
	
	@Override
	@Transactional
	@PreRemove
	public UserInfoDB saveUserInfo(UserInfoDB userInfo){
		try{
			
			return userRepository.saveAndFlush(userInfo);
			
		}
		catch(Exception e){
			
			System.out.println("exception in userInfo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	//dao layer to fetch role using roleId
	@Override
	@Transactional(readOnly = true)
	public Optional <RolesDB> getRole(Long id){
		try{
			return rolesRepository.findById(id);
		}
		
		catch(Exception e){
			System.out.println("exception in userInfo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	//dao layer to save role
	@Override
	@Transactional
	public RolesDB saveRole(RolesDB rolesDB){
		try{
			return rolesRepository.saveAndFlush(rolesDB);
		}
		
		catch(Exception e){
			System.out.println("exception in userInfo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	//email is mandatory for getting userInfo
	@Override
	@Transactional(readOnly = true)
	public Optional <UserInfoDB> getUserInfo(String email){
		try{
			return userRepository.findByEmail(email);
		}
		catch(Exception e){
			System.out.println("exception in getUserInfo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<UserInfoDB> getUserInfoByMobileNo(Long mobileNo){
		try{
			return userRepository.findByMobileNo(mobileNo);
		}
		catch(Exception e){
			System.out.println("exception in getUserInfoByMobileNo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	//userDetailsId is mandatory for getting userInfo
	@Override
	@Transactional(readOnly = true)
	public Optional <UserInfoDB> getUserInfoById(Long userDetailsId){
		try{
			if (!Objects.isNull(userDetailsId) && userRepository.existsById(userDetailsId))
				return userRepository.findByUserDetailsId(userDetailsId);
			
			else return Optional.empty();
		}
		catch(Exception e){
			System.out.println("exception in getUserInfo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <UserCredentialsDB> getUserCredentials(String userName){
		try{
			return userCredentialsRepository.findByUsername(userName);
		}
		catch(Exception e){
			System.out.println("exception in getUserInfo " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public OneTimePasswordEntityDB saveOtp(OneTimePasswordEntityDB oneTimePasswordEntity){
		try{
			return oneTimePasswordRepo.save(oneTimePasswordEntity);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <OneTimePasswordEntityDB> getOtpInfo(String identifier){
		try{
			return oneTimePasswordRepo.findByIdentifier(identifier.trim());
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public List <OrganizationsDB> findOrganizationsByMasterId(Long organizationId){
		try{
			return organizationsRepo.findOrganizationsByMasterId(organizationId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <OrganizationsDB> findOrganizationsById(Long orgId){
		try{
			return organizationsRepo.findOrganizationsById(orgId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <OrganizationMasterDB> findOrganizationMasterById(Long organizationId){
		try{
			return organizationMasterRepo.findOrganizationMasterById(organizationId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <OrganizationMasterDB> duplicateOrganizationMasterCode(String organizationCode){
		try{
			return organizationMasterRepo.findOrganizationMasterByCode(organizationCode);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public List <OrganizationMasterDB> saveOrganizationMaster(List <OrganizationMasterDB> organizationMasterDB){
		try{
			return organizationMasterRepo.saveAllAndFlush(organizationMasterDB);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <LiveClassEntity>> fetchLiveClass(Optional <LocalDate> date){
		try{
			return liveClassRepository.findByMeetDate(date.orElse(null));
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <LiveClassEntity> fetchLiveClassById(Long liveClassId){
		try{
			return liveClassRepository.findById(liveClassId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveLiveClass(LiveClassEntity liveClassEntity){
		try{
			LiveClassEntity savedEntity = liveClassRepository.saveAndFlush(liveClassEntity);
			
			if (!Objects.isNull(savedEntity.getLiveClassId())) {
				return Boolean.TRUE;
			}
			
			return Boolean.FALSE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <LiveClassesEntity>> fetchLiveClassesByBatchIdAndDate(Long batchId, LocalDate date){
		try{
			
			return liveClassesRepository.fetchLiveClassesByBatchIdAndDate(batchId, date);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean submitObjectiveTest(List <ObjectiveTestSubmit> objectiveTestSubmit){
		try{
			courseObjectiveTestSubmitRepo.saveAllAndFlush(objectiveTestSubmit);
			
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional
	public Boolean submitSubjectiveTest(List <SubjectiveTestSubmit> subjectiveTestSubmit){
		try{
			courseSubjectiveTestSubmitRepo.saveAllAndFlush(subjectiveTestSubmit);
			
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	//dao layer method to save a webinar for a date
	@Override
	@Transactional
	public Boolean saveWebinar(WebinarEntity webinarEntity){
		return webinarRepo.saveAndFlush(webinarEntity) != null;
	}
	
	
	//dao layer method to save a single webinar
	@Override
	@Transactional
	public Boolean saveWebinarInfo(WebinarInfo webinarInfo){
		return webinarInfoRepo.saveAndFlush(webinarInfo) != null;
	}
	
	//dao Layer method to fetch webinar details by date or webinarId
	@Override
	@Transactional(readOnly = true)
	public Optional <WebinarEntity> fetchWebinarMaster(LocalDate searchDate, Optional <Long> webinarId){
		if (webinarId.isPresent()) {
			return webinarRepo.findById(webinarId.get());
		}

		if (searchDate != null) {
			return webinarRepo.findByWebinarDate(searchDate);
		}

		return Optional.empty();
	}
	
	//dao layer to fetch Active webinar Info Details based on webinarInfoId
	@Override
	@Transactional(readOnly = true)
	public Optional <WebinarInfo> fetchActiveWebinarInfoById(Long webinarInfoId){
		
		return webinarInfoRepo.fetchActiveWebinarInfoById(webinarInfoId);
		
	}
	
	//dao layer to fetch All webinar Info Details based on webinarInfoId
	@Override
	@Transactional(readOnly = true)
	public Optional <WebinarInfo> fetchAllWebinarInfoById(Long webinarInfoId){
		
		return webinarInfoRepo.fetchAllWebinarInfoById(webinarInfoId);
		
	}
	
	//dao layer method to fetch list of webinars from today
	@Override
	@Transactional(readOnly = true)
	public Optional <List <WebinarEntity>> fetchWebinarDetailsFromToday(){
		
		return webinarRepo.findWebinarsFromDate(LocalDate.now());
	}
	
	//dao layer method to fetch list of webinars(fetching child webinarInfo on request of client Team)
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <WebinarInfo>> fetchWebinarSchedules(LocalDateTime today, Pageable pageable, Long subjectId){
		Page<WebinarInfo> webinarInfoPage;

		if (today != null && subjectId != null) {
			webinarInfoPage = webinarInfoRepo.findByIsActiveTrueAndWebinarStartTimeGreaterThanEqualAndSubjectMasterDB_SubjectMasterIdOrderByCreationTimeStampDesc(today, subjectId, pageable);
		} else if (today != null) {
			webinarInfoPage = webinarInfoRepo.findByIsActiveTrueAndWebinarStartTimeGreaterThanEqualOrderByCreationTimeStampDesc(today, pageable);
		} else if (subjectId != null) {
			webinarInfoPage = webinarInfoRepo.findByIsActiveTrueAndSubjectMasterDB_SubjectMasterIdOrderByCreationTimeStampDesc(subjectId, pageable);
		} else {
			webinarInfoPage = webinarInfoRepo.findByIsActiveTrueOrderByCreationTimeStampDesc(pageable);
		}

		return Optional.of(webinarInfoPage);
	}
	
	//dao Layer method to save registrations of webinars
	@Override
	@Transactional
	public Boolean registerWebinar(WebinarRegister webinarRegister){
		try{
			
			webinarRegisterRepo.saveAndFlush(webinarRegister);
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer method to save webinarDetails in webinar_attendance table
	@Override
	@Transactional
	public Boolean joinWebinar(WebinarAttended webinarAttended){
		try{
			webinarAttendedRepo.saveAndFlush(webinarAttended);
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
		
	}
	
	//dao layer method to fetch list of webinar registered from username
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <Long>> fetchRegisteredWebinarInfoIds(String username, Pageable pageable){
		
		return webinarRegisterRepo.fetchRegisteredWebinarInfoIds(username, pageable);
	}
	
	//dao layer to fetch list of webinar attended from username
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <Long>> fetchAttendedWebinarsInfoIds(String username, Pageable pageable){
		
		return webinarAttendedRepo.fetchAttendedWebinarsInfoIds(username, pageable);
	}
	
	
	//dao layer to fetch list of webinar attended from username and webinarInfoId
	@Override
	@Transactional(readOnly = true)
	public Optional <WebinarAttended> alreadyAttendedWebinar(String username, Long webinarInfoId){
		
		return webinarAttendedRepo.alreadyAttendedWebinar(username, webinarInfoId);
	}
	
	
	//dao layer method to fetch list of userDetailsId based on webinarInfoId
	@Override
	@Transactional(readOnly = true)
	public Optional <List <WebinarRegister>> fetchRegisteredStudents(Long webinarInfoId){
		
		return webinarRegisterRepo.fetchRegisteredStudents(webinarInfoId);
		
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <Long>> fetchRegisteredWebinarInfoByStudent(String userName){
		
		return webinarRegisterRepo.fetchRegisteredWebinarInfoByStudent(userName);
		
	}
	
	@Override
	@Transactional(readOnly = true)
	public Boolean webinarRegistrationExists(String username, Long webinarInfoId){

		return webinarRegisterRepo.existsByUsernameAndWebinarInfoId(username, webinarInfoId);

	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <WebinarInfo> findWebinarDateWise(Long webinarInfoId, LocalDate date){
		try{
			return webinarInfoRepo.findWebinarDateWise(webinarInfoId, date);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	//dao layer method to fetch list of userDetailsId based on webinarInfoId
	@Override
	@Transactional(readOnly = true)
	public Optional <List <WebinarAttended>> fetchAttendedStudents(Long webinarInfoId){
		return webinarAttendedRepo.fetchAttendedStudents(webinarInfoId);
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <BatchDB> findBatchById(Long batchId){
		try{
			return batchRepo.findBatchById(batchId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <BatchDB>> findBatchById(Long batchId, Pageable pageable){
		try{
			return batchRepo.findBatchByIdPageable(batchId, pageable);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <BatchDB>> findAllBatches(){
		try{
			return Optional.ofNullable(batchRepo.findAllBatches());
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public List <BatchDB> findAllBatchesByOrganizationId(Long orgId){
		try{
			return batchRepo.findAllBatchesByOrganizations(orgId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <BatchDB>> findAllBatchesByOrganizationId(Long orgId, Pageable pageable){
		try{
			return batchRepo.findAllBatchesByOrganizations(orgId, pageable);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public BatchDB persistBatchMaster(BatchDB batchDB){
		try{
			return batchRepo.saveAndFlush(batchDB);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <TestDB>> findTestByCourseId(Long courseId){
		try{
			return testRepo.findTestByCourseId(courseId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <TestDB> findTestById(Long testId){
		try{
			return testRepo.findActiveTestById(testId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <TestDB> findActiveAndPublishedTestById(Long testId){
		try{
			return testRepo.findActiveAndPublishedTestById(testId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <TestDB> findUpcomingTestsById(Long testId){
		try{
			return testRepo.findUpcomingTestsById(testId, LocalDateTime.now());
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public List <TestQuestionsDB> findByTestDB(TestDB testDB){
		try{
			return testQuestionsRepo.findByTestDB(testDB);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public List <TestAnswersDB> findByTestQuestionsDB(TestQuestionsDB testQuestionsDB){
		try{
			return testAnswersRepo.findByTestQuestionsDB(testQuestionsDB);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public CorrectAnswerDB findByCorrectTestQuestionsDB(TestQuestionsDB testQuestionsDB){
		try{
			return correctAnswerRepo.findByTestQuestionsDB(testQuestionsDB);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public List <ObjectiveTestSubmit> findObjectviteTestByTestIdAndStudentIdAndQuestionId(Long testId, Long studentId, Long questionId){
		try{
			return courseObjectiveTestSubmitRepo.findByTestIdAndStudentIdAndQuestionId(testId, studentId, questionId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public List <SubjectiveTestSubmit> findSubjectiveTestByTestIdAndStudentIdAndQuestionId(Long testId, Long studentId, Long questionId){
		try{
			return courseSubjectiveTestSubmitRepo.findByTestIdAndStudentIdAndQuestionId(testId, studentId, questionId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public TestDB findTestsDateWise(Long testId, LocalDate date){
		try{
			return testRepo.findTestsDateWise(testId, date);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional
	public Boolean persistTestStudentRelation(TestStudentRelation testStudentRelation){
		try{
			TestStudentRelation testStudentRelation1 = testStudentRelationRepo.saveAndFlush(testStudentRelation);
			if (testStudentRelation1.getTestStudentRelationId() != null) {
				return Boolean.TRUE;
			} else {
				return Boolean.FALSE;
			}
			
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	public Boolean saveAllTestStudentRelation(List <TestStudentRelation> testStudentRelationList){
		try{
			testStudentRelationRepo.saveAll(testStudentRelationList);
			
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <BatchStudentEnrollmentsDB>> fetchStudentBatchEnrollments(Long userDetailsId){
		try{
			return batchStudentEnrollmentRepo.findByStudentIdAndIsActive(userDetailsId, Boolean.TRUE);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	//dao layer method to fetch Active Library Master
	@Override
	@Transactional(readOnly = true)
	public Optional <List <LibraryMasterDB>> fetchLibraryMaster(){
		
		return libraryMasterRepo.findActiveMaterial();
		
	}
	
	//dao layer method to fetch Active Library Master
	@Override
	@Transactional(readOnly = true)
	public Optional <List <LibraryMasterDB>> fetchLibraryMasterWhereMaterialIdIsNot(Boolean isActive, List <Long> materialIds){
		
		return libraryMasterRepo.findLibraryMasterDBByMaterialId(isActive, materialIds);
		
	}
	
	//dao layer method to fetch all courses using pagination
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <LibraryMasterDB>> fetchAllCourses(Pageable pageable){
		try{
			return libraryMasterRepo.fetchAllCourses(pageable);
			
		}
		catch(Exception e){
			
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Optional.empty();
			
		}
	}
	
	//dao layer method to fetch active material from LibraryMaster using materialId
	@Override
	@Transactional(readOnly = true)
	public Optional <LibraryMasterDB> fetchActiveLibraryMasterById(Long materialId){
		return libraryMasterRepo.fetchActiveLibraryMasterById(materialId);
	}
	
	//dao layer method to fetch all material from LibraryMaster using materialId
	@Override
	@Transactional(readOnly = true)
	public Optional <LibraryMasterDB> fetchAllLibraryMasterById(Long materialId){
		return libraryMasterRepo.fetchAllLibraryMasterById(materialId);
	}
	
	
	//dao layer to save material
	@Override
	@Transactional
	public Boolean saveMaterialDetails(LibraryMasterDB libraryMasterDB){
		try{
			libraryMasterRepo.saveAndFlush(libraryMasterDB);
			
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer method to fetch list of materialsId based on userName
	@Override
	@Transactional(readOnly = true)
	public Optional <List <MaterialEnrollmentDB>> fetchEnrolledMaterials(String username, Optional <Boolean> isCompleted){
		
		return materialEnrollmentRepo.fetchActiveEnrolledMaterials(username, isCompleted.orElse(null));
		
	}
	
	//dao layer method to fetch MaterialEnrollmentDB object based on id
	@Override
	@Transactional(readOnly = true)
	public Optional <MaterialEnrollmentDB> fetchEnrolledMaterialUsingId(Long id){
		
		try{
			return materialEnrollmentRepo.findById(id);
		}
		
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
		
	}
	
	
	//dao layer method to fetch enrollment status of a student into a material
	@Override
	@Transactional(readOnly = true)
	public Optional <MaterialEnrollmentDB> fetchEnrollmentStatus(Long materialId, String username){
		return materialEnrollmentRepo.fetchEnrollmentStatus(materialId, username);
	}
	
	
	//dao layer method to save enrollment into a material
	@Override
	@Transactional
	public Boolean saveMaterialEnrollment(MaterialEnrollmentDB materialEnrollmentDB){
		try{
			
			materialEnrollmentRepo.saveAndFlush(materialEnrollmentDB);
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer method to fetch list of correct answers based on list of questionIds
	@Override
	@Transactional(readOnly = true)
	public Optional <List <QuizCorrectAnswersDB>> fetchCorrectAnswers(List <Long> questionIds){
		
		return quizCorrectAnswerRepo.fetchCorrectAnswers(questionIds);
	}
	
	//dao Layer method to fetch Active chapter details based on chapter id
	@Override
	@Transactional(readOnly = true)
	public Optional <ChaptersDB> fetchActiveChapterDetails(Long chapterId){
		return chapterMasterRepo.fetchActiveChapterDetails(chapterId);
	}
	
	//dao Layer method to fetch All chapter details based on chapter id
	@Override
	@Transactional(readOnly = true)
	public Optional <ChaptersDB> fetchAllChapterDetails(Long chapterId){
		return chapterMasterRepo.fetchAllChapterDetails(chapterId);
	}
	
	//dao layer method to fetch active contents in a chapter
	@Override
	@Transactional(readOnly = true)
	public Optional <List <ContentsDB>> fetchActiveContentsByChapterId(Long chapterId){
		return contentsDBRepo.fetchActiveContentsByChapterId(chapterId);
	}
	
	//dao layer method to fetch Active content details by contentId
	@Override
	@Transactional(readOnly = true)
	public Optional <ContentsDB> fetchActiveContentDetails(Long contentId){
		return contentsDBRepo.fetchActiveContentDetails(contentId);
	}
	
	@Transactional(readOnly = true)
	@Override
	public Optional <Page <LibraryMasterDB>> getAllCourses(Pageable pageable, Optional<Long> subjectId){
		try{
			return libraryMasterRepo.getActiveCoursesBySubject(pageable, subjectId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	@Override
	public Boolean deleteQuizQuestion(Long questionId){
		try{
			quizQuestionMasterRepo.deleteById(questionId);
			
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer to fetch quiz details based on quizId
	@Override
	@Transactional(readOnly = true)
	public Optional <QuizDB> fetchAllQuizDetails(Long quizId){
		return quizMasterRepo.fetchAllQuizDetails(quizId);
	}
	
	//dao layer to fetch quiz question based on questionId
	@Override
	@Transactional(readOnly = true)
	public Optional <QuizQuestionsDB> fetchQuizQuestions(Long questionId){
		return quizQuestionMasterRepo.findById(questionId);
	}
	
	//dao layer to fetch quiz question based on questionId
	@Override
	@Transactional
	public Boolean updateQuizQuestions(QuizQuestionsDB quizQuestionsDB){
		
		try{
			
			quizQuestionMasterRepo.saveAndFlush(quizQuestionsDB);
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	
	//dao layer method to save chapter details
	@Override
	@Transactional
	public Boolean saveChapterDetails(ChaptersDB chaptersDB){
		try{
			chapterMasterRepo.saveAndFlush(chaptersDB);
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer method to save Quiz details
	@Override
	@Transactional
	public Boolean saveQuizDetails(QuizDB quizDB){
		try{
			quizMasterRepo.saveAndFlush(quizDB);
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer method to save completed chapter details
	@Override
	@Transactional
	public Boolean saveCompletedChapter(EnrolledChaptersDB completedChaptersDB){
		
		try{
			completedChaptersRepo.saveAndFlush(completedChaptersDB);
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	//dao layer method to fetch materials by tutorId(taken materialId so as to filter out the same material which the student had opened)
	@Override
	@Transactional(readOnly = true)
	public Optional <List <LibraryMasterDB>> fetchMaterialsByTutorId(Long tutorId, Long materialId){
		try{
			
			return libraryMasterRepo.findByTutorId(tutorId, materialId);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	//dao layer method to fetch list of completed chapter based on username
	@Override
	@Transactional(readOnly = true)
	public Optional <List <EnrolledChaptersDB>> fetchCompletedChapters(String username){
		return completedChaptersRepo.fetchActiveCompletedChapters(username);
	}
	
	//dao layer method to fetch list of completed chapter based on username
	@Override
	@Transactional(readOnly = true)
	public Optional <EnrolledChaptersDB> fetchEnrolledChapters(Long enrollmentId){
		try{
			return completedChaptersRepo.findById(enrollmentId);
		}
		
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	//dao layer method to fetch list of certificates for a student
	@Override
	@Transactional(readOnly = true)
	public Optional <List <CertificateMasterDB>> fetchCertificates(String username){
		return certificateRepo.fetchCertificates(username);
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <TestQuestionsDB>> findQuestionsFromTestId(Long testId){
		try{
			return testQuestionsRepo.findQuestionsFromTestId(testId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional
	public TestDB saveTestMaster(TestDB testInput){
		try{
			return testRepo.saveAndFlush(testInput);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <BatchTutorEnrollmentDB>> fetchTutorBatchEnrollments(Long userDetailsId){
		try{
			return batchTutorEnrollmentRepo.findByTutorIdAndIsActive(userDetailsId, Boolean.TRUE);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public HelpAndSupportEntity saveHelpAndSupport(HelpAndSupportEntity helpAndSupportEntity){
		try{
			return helpAndSupportRepository.save(helpAndSupportEntity);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <HelpAndSupportEntity> findUnResolvedHelpById(Long grievanceId){
		try{
			return helpAndSupportRepository.findHelpAndSupportById(grievanceId, Boolean.FALSE);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <HelpAndSupportEntity>> findAllHelpAndSupport(Long branchId, Boolean isResolved, LocalDateTime threeMonthsAgo){
		try{
			return helpAndSupportRepository.findAllHelpAndSupport(branchId, isResolved, threeMonthsAgo);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <HelpAndSupportEntity>> findHelpAndSupportStudentWise(Long complainantId, LocalDateTime threeMonthsAgo){
		try{
			return helpAndSupportRepository.findHelpAndSupportStudentWise(complainantId, threeMonthsAgo);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <HelpAndSupportEntity>> findAllTimeHelpAndSupport(Long branchId, Boolean isResolved){
		try{
			return helpAndSupportRepository.findAllTimeHelpAndSupport(branchId, isResolved);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	@Override
	@Transactional
	public void deleteHelpAndSupport(Long grievanceId) {
		try {
			helpAndSupportRepository.deleteById(grievanceId);
		} catch (Exception e) {
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException("Failed to delete Help and Support Ticket: " + e.getMessage());
		}
	}

	
	
	@Override
	@Transactional
	public AnnouncementEntity persistAnnouncementMaster(AnnouncementEntity announcement){
		try{
			return announcementRepo.saveAndFlush(announcement);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <UserInfoDB>> getAllUsers(){
		try{
			return Optional.of(userRepository.findAll());
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <Page <RolesDB>> getAllUsersByRole(String role, Pageable pageable){
		try{
			return rolesRepository.getAllUsersByRole(role, pageable);
			
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <AnnouncementEntity>> fetchAllAnnouncements(Long branchId){
		try{
			if (branchId != null) {
				return announcementRepo.fetchAllActiveAnnouncements(branchId);
			}
			return Optional.of(announcementRepo.findByIsActiveTrueOrderByCreationTimeStampDesc());
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public Boolean persistAnnouncementRead(AnnouncementReadEntity announcementRead){
		try{
			AnnouncementReadEntity announcementRead1 = announcementReadRepo.saveAndFlush(announcementRead);
			if (announcementRead1.getAnnouncementReadId() != null) {
				return Boolean.TRUE;
			} else {
				return Boolean.FALSE;
			}
			
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <AnnouncementEntity> findActiveAnnouncementById(Long announcementId){
		try{
			return announcementRepo.findActiveAnnouncementById(announcementId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <AnnouncementReadEntity>> fetchAnnouncementReadByAnnouncementId(Long announcementId){
		try{
			return announcementReadRepo.fetchAnnouncementReadByAnnouncementId(announcementId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <AnnouncementReadEntity>> fetchAnnouncementReadByStudentIdAndStatus(Long studentId, Boolean markAsRead, LocalDateTime startDate){
		try{
			return announcementReadRepo.fetchAnnouncementReadByStudentIdAndStatus(studentId, markAsRead, startDate);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public List <HolidayMaster> saveHolidayMaster(List <HolidayMaster> holidayMaster){
		try{
			return holidayRepo.saveAllAndFlush(holidayMaster);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <HolidayMaster> fetchHolidayMasterById(Long holidayId){
		try{
			return holidayRepo.findById(holidayId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public List <HolidayMaster> fetchAllHolidays(Long branchId){
		try{
			return holidayRepo.findAllHolidays(branchId);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public List <HolidayMaster> fetchHolidaysDateWise(Long branchId, LocalDate date){
		try{
			return holidayRepo.findHolidaysDateWise(branchId, date);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <MaterialEnrollmentDB>> fetchEnrollmentsInAllCourses(){
		try{
			return Optional.of(materialEnrollmentRepo.findAll());
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveBatchCourseRelation(BatchCourseRelationEntity batchCourseRelation){
		try{
			if (!Objects.isNull(batchCourseRelationRepo.save(batchCourseRelation).getBatchCourseRelationId()))
				return Boolean.TRUE;
			else return Boolean.FALSE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <BatchCourseRelationEntity>> fetchBatchCourses(Long batchId){
		try{
			
			return batchCourseRelationRepo.findByBatchId(batchId);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <BatchCourseRelationEntity> fetchBatchCoursesForRemove(Long batchId, Long tutorId, Long courseId){
		try{
			
			return batchCourseRelationRepo.fetchBatchCoursesForRemove(batchId, tutorId, courseId);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveBatchTestRelation(BatchTestRelationEntity batchTestRelation){
		try{
			if (!Objects.isNull(batchTestRelationRepo.save(batchTestRelation).getBatchTestRelationId()))
				return Boolean.TRUE;
			else return Boolean.FALSE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <BatchTestRelationEntity>> fetchBatchTests(Long batchId, TestType testType){
		try{
			
			return batchTestRelationRepo.findBTRByBatchId(batchId, testType);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <BatchTestRelationEntity> fetchBatchTestsForRemove(Long batchId, Long courseId, Long testId){
		try{
			
			return batchTestRelationRepo.fetchBatchTestsForRemove(batchId, courseId, testId);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <BatchCourseRelationEntity> findByBatchIdAndCourseId(Long batchId, Long courseId){
		try{
			
			return batchCourseRelationRepo.findByBatchIdAndCourseId(batchId, courseId);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <CourseMaster>> fetchCourseMaster(){
		try{
			return Optional.of(courseMasterRepo.findAll());
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <RolesDB>> fetchAllStudentList(){
		try{
			
			return rolesRepository.fetchAllStudentList();
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <RolesDB>> fetchAllTeacherList(){
		try{
			
			return rolesRepository.fetchAllTeacherList();
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <RolesDB>> fetchAllAdminList(){
		try{
			
			return rolesRepository.fetchAllAdminList();
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Optional <List <RolesDB>> fetchAllSuperAdminList(){
		try{
			return rolesRepository.fetchAllSuperAdminList();
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());

			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public List <TestDB> findOverlappingTests(List <Long> testIds, LocalDateTime startDate, LocalDateTime endDate){
		try{
			
			return testRepo.findOverlappingTests(testIds, startDate, endDate, LocalDateTime.now());
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Collections.emptyList();
		}
	}
	
	@Override
	@Transactional
	public Boolean saveAllMaterialEnrollments(List <MaterialEnrollmentDB> materialEnrollmentDBList){
		try{
			
			materialEnrollmentRepo.saveAllAndFlush(materialEnrollmentDBList);
			
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	@Transactional(readOnly = true)
	@Override
	public Integer fetchEnrolledCoursesCountOfStudent(String username){
		try{
			return materialEnrollmentRepo.countCourseEnrollments(username);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return 0;
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Integer countTotalEnrollmentsInCourse(Long materialId){
		try{
			return materialEnrollmentRepo.countStudentEnrollments(materialId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return 0;
		}
	}
	
	@Override
	@Transactional
	public Boolean deleteContent(Long contentId){
		try{
			contentsDBRepo.deleteById(contentId);
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <BatchStudentEnrollmentsDB> findBatchStudents(Long studentId, Long batchId){
		try{
			
			return batchStudentEnrollmentRepo.findBatchStudents(studentId, batchId);
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveBatchStudents(BatchStudentEnrollmentsDB batchStudentEnrollmentsDB){
		try{
			
			BatchStudentEnrollmentsDB saved = batchStudentEnrollmentRepo.saveAndFlush(batchStudentEnrollmentsDB);
			
			if (!Objects.isNull(saved.getEnrollmentId())) {
				
				return Boolean.TRUE;
			}
			
			return Boolean.FALSE;
			
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <BatchStudentEnrollmentsDB>> findStudentsEnrolledInABatch(Long batchId){
		try{
			return batchStudentEnrollmentRepo.findStudentsEnrolledInABatch(batchId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveAttempt(TestStudentRelation testStudentRelation){
		try{
			
			TestStudentRelation relation = testStudentRelationRepo.saveAndFlush(testStudentRelation);
			
			if (!Objects.isNull(relation.getTestStudentRelationId())) {
				return Boolean.TRUE;
			}
			
			return Boolean.FALSE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <TestStudentRelation> fetchTestAttempt(Long testId, Long studentId){
		try{
			
			return testStudentRelationRepo.findAttemptedTestByTestIdAndStudentId(testId, studentId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <TestStudentRelation> fetchTestUnAttempt(Long testId, Long studentId){
		try{
			
			return testStudentRelationRepo.findUnAttemptedTestByTestIdAndStudentId(testId, studentId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveFeedback(FeedbackEntity feedbackEntity){
		try{
			
			FeedbackEntity saved = feedbackRepo.saveAndFlush(feedbackEntity);
			if (!Objects.isNull(saved.getFeedbackId())) {
				return Boolean.TRUE;
			}
			return Boolean.FALSE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveContactUs(ContactUsEntity contactUsEntity){
		try{
			
			ContactUsEntity saved = contactUsRepo.saveAndFlush(contactUsEntity);
			if (!Objects.isNull(saved.getContactUsId())) {
				return Boolean.TRUE;
			}
			return Boolean.FALSE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public Boolean saveCountryMaster(List <CountryMaster> countryMasterList){
		try{
			countryMasterRepo.saveAllAndFlush(countryMasterList);
			
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <CountryMaster>> getCountryMaster(){
		try{
			return Optional.of(countryMasterRepo.findAll());
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveRoleMaster(RoleMaster roleMaster){
		try{
			roleMasterRepo.saveAndFlush(roleMaster);
			return Boolean.TRUE;
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Boolean.FALSE;
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <RoleMaster> getRoleMasterById(Long roleMasterId){
		try{
			return roleMasterRepo.findById(roleMasterId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <RoleMaster>> getRoleMaster(){
		try{
			return Optional.of(roleMasterRepo.findAll());
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Optional.empty();
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <RoleMaster> getRoleMasterByCode(String roleMasterCode){
		try{
			return roleMasterRepo.findRoleMasterByRoleMasterCodeIgnoreCase(roleMasterCode);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Optional.empty();
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Optional <RoleMaster> getRoleMasterByName(String roleMasterName){
		try{
			return roleMasterRepo.findRoleMasterByRoleMasterNameIgnoreCase(roleMasterName);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return Optional.empty();
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Long countActiveUsersByRoleMasterId(Long roleMasterId){
		try{
			return roleMasterRepo.countActiveUsersByRoleMasterId(roleMasterId);
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			return 0L;
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <SubjectMasterDB> getSubject(Long subjectMasterId){
		try{
			return subjectMasterRepo.findById(subjectMasterId);
		}
		catch(Exception e){
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public Boolean saveSubjectMaster(SubjectMasterDB subjectMasterDB){
		try{
			subjectMasterRepo.saveAndFlush(subjectMasterDB);
			
			return Boolean.TRUE;
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Boolean.FALSE;
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional <List <SubjectMasterDB>> getAllSubjects(){
		try{
			
			return subjectMasterRepo.findAllActiveSubjects();
			
		}
		catch(Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());
			
			return Optional.empty();
		}
	}
	
	
	@Override
	@Transactional
	public List <SubjectMasterDB> saveSubjectMaster(List <SubjectMasterDB> subjectMasterDB){
		try{
			return subjectMasterRepo.saveAllAndFlush(subjectMasterDB);
		}
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional<List<TestDB>> fetchAssessmentsByTeacherAndBatch(Long teacherId, Long batchId) {
		try {
			if (batchId != null) {
				return Optional.ofNullable(testRepo.findByCreatedByAndBatchIdAndIsActiveTrue(teacherId, batchId));
			} else {
				return Optional.ofNullable(testRepo.findByCreatedByAndIsActiveTrue(teacherId));
			}
		} catch (Exception e) {
			logger.error("Error in fetchAssessmentsByTeacherAndBatch: " + e.getMessage());
			return Optional.empty();
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<List<SubjectiveTestSubmit>> fetchSubmissionsByTestId(Long testId) {
		try {
			return Optional.ofNullable(courseSubjectiveTestSubmitRepo.findByTestId(testId));
		} catch (Exception e) {
			logger.error("Error in fetchSubmissionsByTestId: " + e.getMessage());
			return Optional.empty();
		}
	}

	@Override
	@Transactional
	public Boolean evaluateSubmission(SubjectiveTestSubmit evaluation) {
		try {
			Optional<SubjectiveTestSubmit> existingOpt = courseSubjectiveTestSubmitRepo.findById(evaluation.getTestSubmissionId());
			if (existingOpt.isPresent()) {
				SubjectiveTestSubmit existing = existingOpt.get();
				existing.setMarksObtained(evaluation.getMarksObtained());
				existing.setFeedback(evaluation.getFeedback());
				courseSubjectiveTestSubmitRepo.saveAndFlush(existing);
				return Boolean.TRUE;
			}
			return Boolean.FALSE;
		} catch (Exception e) {
			logger.error("Error in evaluateSubmission: " + e.getMessage());
			return Boolean.FALSE;
		}
	}
}
