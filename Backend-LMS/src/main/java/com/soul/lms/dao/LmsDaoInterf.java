package com.soul.lms.dao;

import com.soul.lms.model.entity.contactus.ContactUsEntity;
import com.soul.lms.model.entity.feedback.FeedbackEntity;
import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import com.soul.lms.model.entity.announcement.AnnouncementReadEntity;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.batchrelation.BatchTestRelationEntity;
import com.soul.lms.model.entity.certificate.CertificateMasterDB;
import com.soul.lms.model.entity.liveclass.LiveClassEntity;
import com.soul.lms.model.entity.liveclass.LiveClassesEntity;
import com.soul.lms.model.entity.modelmasters.CountryMaster;
import com.soul.lms.model.entity.modelmasters.CourseMaster;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import com.soul.lms.model.entity.studymaterial.*;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import com.soul.lms.model.entity.modelmasters.masterentitydb.*;
import com.soul.lms.model.entity.modelonetimepassword.onetimepassworddb.OneTimePasswordEntityDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.studymaterial.quiz.QuizCorrectAnswersDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizQuestionsDB;
import com.soul.lms.model.entity.tests.*;
import com.soul.lms.model.entity.webinar.WebinarAttended;
import com.soul.lms.model.entity.webinar.WebinarEntity;
import com.soul.lms.model.entity.webinar.WebinarInfo;
import com.soul.lms.model.entity.webinar.WebinarRegister;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LmsDaoInterf
{

	// User Info
	UserInfoDB saveUserInfo(UserInfoDB userInfo);
	Optional <UserInfoDB> getUserInfo(String email);
	Optional <UserInfoDB> getUserInfoByMobileNo(Long mobileNo);
	Optional <UserInfoDB> getUserInfoById(Long userDetailsId);
	Optional<RolesDB> getRole(Long id);
	RolesDB saveRole(RolesDB rolesDB);
	Optional<UserCredentialsDB> getUserCredentials(String userName);
	OneTimePasswordEntityDB saveOtp(OneTimePasswordEntityDB oneTimePasswordEntity);
	Optional<OneTimePasswordEntityDB> getOtpInfo(String identifier);


	// Organization Parent
	Optional<OrganizationMasterDB> findOrganizationMasterById(Long organizationId);
	Optional<OrganizationMasterDB> duplicateOrganizationMasterCode(String organizationCode);
	List<OrganizationMasterDB> saveOrganizationMaster(List<OrganizationMasterDB> organizationMasterDB);


	// Organizations Child
	List<OrganizationsDB> findOrganizationsByMasterId(Long organizationId);
	Optional<OrganizationsDB> findOrganizationsById(Long orgId);


	// Live Classes
	Optional<List<LiveClassEntity>> fetchLiveClass(Optional<LocalDate> date);
	Optional<LiveClassEntity> fetchLiveClassById(Long liveClassId);
	Boolean saveLiveClass(LiveClassEntity liveClassEntity);
	Optional<List<LiveClassesEntity>> fetchLiveClassesByBatchIdAndDate(Long batchId, LocalDate date);


	//Webinar Methods
	Boolean saveWebinar(WebinarEntity webinarEntity);
	Boolean saveWebinarInfo(WebinarInfo webinarInfo);
	Optional<WebinarEntity>fetchWebinarMaster(LocalDate today, Optional<Long> webinarId);
	Optional<WebinarInfo> fetchActiveWebinarInfoById(Long webinarInfoId);
	Optional<WebinarInfo> fetchAllWebinarInfoById(Long webinarInfoId);
	Optional<List<WebinarEntity>> fetchWebinarDetailsFromToday();
	Optional<Page<WebinarInfo>> fetchWebinarSchedules(LocalDateTime today, Pageable pageable, Long subjectId);
	Boolean registerWebinar(WebinarRegister webinarRegister);
	Boolean joinWebinar(WebinarAttended webinarAttended);
Optional<Page<Long>> fetchRegisteredWebinarInfoIds(String username,Pageable pageable);
Optional<Page<Long>> fetchAttendedWebinarsInfoIds(String username, Pageable pageable);
Optional<WebinarAttended> alreadyAttendedWebinar(String username, Long webinarInfoId);
Optional<List<WebinarRegister>> fetchRegisteredStudents(Long webinarInfoId);
Optional<List<Long>> fetchRegisteredWebinarInfoByStudent(String userName);
Optional<WebinarInfo> findWebinarDateWise(Long webinarInfoId, LocalDate date);
Optional<List<WebinarAttended>> fetchAttendedStudents(Long webinarInfoId);
	Boolean webinarRegistrationExists(String username, Long webinarInfoId);


	// Batches
	Optional<BatchDB> findBatchById(Long batchId);
	Optional<Page<BatchDB>> findBatchById(Long batchId, Pageable pageable);
	Optional<List<BatchDB>> findAllBatches();
	List<BatchDB> findAllBatchesByOrganizationId(Long orgId);
	Optional<Page<BatchDB>> findAllBatchesByOrganizationId(Long orgId, Pageable pageable);
	BatchDB persistBatchMaster(BatchDB batchDB);


	// Tests
	Optional<List<TestDB>> findTestByCourseId(Long courseId);
	Optional<TestDB> findTestById(Long testId);
	Optional<TestDB> findActiveAndPublishedTestById(Long testId);
	Optional<TestDB> findUpcomingTestsById(Long testId);
	List<TestQuestionsDB> findByTestDB(TestDB testDB);
	List<TestAnswersDB> findByTestQuestionsDB(TestQuestionsDB testQuestionsDB);
	CorrectAnswerDB findByCorrectTestQuestionsDB(TestQuestionsDB testQuestionsDB);
	List<ObjectiveTestSubmit> findObjectviteTestByTestIdAndStudentIdAndQuestionId(Long testId, Long studentId, Long questionId);
	List<SubjectiveTestSubmit> findSubjectiveTestByTestIdAndStudentIdAndQuestionId(Long testId, Long studentId, Long questionId);
	Optional<List<TestQuestionsDB>> findQuestionsFromTestId(Long testId);
	TestDB saveTestMaster(TestDB testInput);
	Boolean submitObjectiveTest(List<ObjectiveTestSubmit> objectiveTestSubmit);
	Boolean submitSubjectiveTest(List<SubjectiveTestSubmit> subjectiveTestSubmit);
	List<TestDB> findOverlappingTests(List<Long> testIds, LocalDateTime startDate, LocalDateTime endDate);
	TestDB findTestsDateWise(Long testId, LocalDate date);
	Boolean persistTestStudentRelation(TestStudentRelation testStudentRelation);
	Boolean saveAllTestStudentRelation(List<TestStudentRelation> testStudentRelationList);


	// Batch Enrollments
	Optional<List<BatchStudentEnrollmentsDB>> fetchStudentBatchEnrollments(Long userDetailsId);
	Optional<List<BatchTutorEnrollmentDB>> fetchTutorBatchEnrollments(Long userDetailsId);
	Optional<BatchStudentEnrollmentsDB> findBatchStudents(Long studentId, Long batchId);
	Boolean saveBatchStudents(BatchStudentEnrollmentsDB batchStudentEnrollmentsDB);
	Optional<List<BatchStudentEnrollmentsDB>> findStudentsEnrolledInABatch(Long batchId);



	//StudyMaterials
	Optional<Page<LibraryMasterDB>> fetchAllCourses(Pageable pageable);
	Optional<List<LibraryMasterDB>> fetchLibraryMaster();
	Optional<LibraryMasterDB> fetchActiveLibraryMasterById(Long materialId);
	Optional<LibraryMasterDB>fetchAllLibraryMasterById(Long materialId);
	Optional<List<MaterialEnrollmentDB>> fetchEnrolledMaterials(String username, Optional<Boolean> isCompleted);
	Optional<MaterialEnrollmentDB> fetchEnrolledMaterialUsingId(Long id);
	Optional<MaterialEnrollmentDB> fetchEnrollmentStatus(Long materialId,String username);
	Boolean saveMaterialEnrollment(MaterialEnrollmentDB materialEnrollmentDB);
	Optional<List<QuizCorrectAnswersDB>> fetchCorrectAnswers(List<Long> questionIds);
	Optional<QuizQuestionsDB> fetchQuizQuestions(Long questionId);
	Boolean updateQuizQuestions(QuizQuestionsDB quizQuestionsDB);
	Optional<ChaptersDB> fetchActiveChapterDetails(Long chapterId);
	Optional<ChaptersDB> fetchAllChapterDetails(Long chapterId);
	Optional<List<ContentsDB>> fetchActiveContentsByChapterId(Long chapterId);
	Optional<QuizDB> fetchAllQuizDetails(Long quizId);
	Boolean saveChapterDetails(ChaptersDB chaptersDB);
	Boolean saveQuizDetails(QuizDB quizDB);
	Boolean saveCompletedChapter(EnrolledChaptersDB completedChaptersDB);
	Optional<List<EnrolledChaptersDB>> fetchCompletedChapters(String username);
	Optional<EnrolledChaptersDB> fetchEnrolledChapters(Long enrollmentId);
	Boolean saveMaterialDetails(LibraryMasterDB libraryMasterDB);
	Optional<List<LibraryMasterDB>> fetchMaterialsByTutorId(Long tutorId, Long materialId);
	Optional<ContentsDB> fetchActiveContentDetails(Long contentId);
	Optional<Page<LibraryMasterDB>> getAllCourses(Pageable pageable, Optional<Long> subjectId);
	Boolean deleteQuizQuestion(Long questionId);
	Optional<List<LibraryMasterDB>> fetchLibraryMasterWhereMaterialIdIsNot(Boolean isActive, List<Long> materialIds);



	// Certificates
	Optional<List<CertificateMasterDB>> fetchCertificates(String username);


	// Help and Support
	HelpAndSupportEntity saveHelpAndSupport(HelpAndSupportEntity helpAndSupportEntity);
	Optional<HelpAndSupportEntity> findUnResolvedHelpById(Long grievanceId);
	Optional<List<HelpAndSupportEntity>> findAllHelpAndSupport(Long branchId, Boolean getIsResolved, LocalDateTime threeMonthsAgo);
	Optional<List<HelpAndSupportEntity>> findHelpAndSupportStudentWise(Long complainantId, LocalDateTime threeMonthsAgo);
	Optional<List<HelpAndSupportEntity>> findAllTimeHelpAndSupport(Long branchId, Boolean getIsResolved);
	void deleteHelpAndSupport(Long grievanceId);


	// Announcements
	AnnouncementEntity persistAnnouncementMaster(AnnouncementEntity announcement);
	Optional<List<AnnouncementEntity>> fetchAllAnnouncements(Long branchId);
	Optional<AnnouncementEntity> findActiveAnnouncementById(Long announcementId);
	Boolean persistAnnouncementRead(AnnouncementReadEntity announcementRead);
	Optional<List<AnnouncementReadEntity>> fetchAnnouncementReadByAnnouncementId(Long announcementId);
	Optional<List<AnnouncementReadEntity>> fetchAnnouncementReadByStudentIdAndStatus(Long studentId, Boolean markAsRead, LocalDateTime startDate);


	// Holiday
	List<HolidayMaster> saveHolidayMaster(List<HolidayMaster> holidayMaster);
	Optional<HolidayMaster> fetchHolidayMasterById(Long holidayId);
	List<HolidayMaster> fetchAllHolidays(Long branchId);
	List<HolidayMaster> fetchHolidaysDateWise(Long branchId, LocalDate date);


	//Admin DashBoard
	Optional<List<UserInfoDB>> getAllUsers();
	Optional<Page<RolesDB>> getAllUsersByRole(String role, Pageable pageable);
	Optional<List<MaterialEnrollmentDB>> fetchEnrollmentsInAllCourses();


	// Batch Course Relation
	Boolean saveBatchCourseRelation(BatchCourseRelationEntity batchCourseRelation);
	Optional<List<BatchCourseRelationEntity>> fetchBatchCourses(Long batchId);
	Optional<BatchCourseRelationEntity> fetchBatchCoursesForRemove(Long batchId, Long tutorId, Long courseId);
	Optional<BatchCourseRelationEntity> findByBatchIdAndCourseId(Long batchId, Long courseId);


	// Batch Test Relation
	Boolean saveBatchTestRelation(BatchTestRelationEntity batchTestRelation);
	Optional<List<BatchTestRelationEntity>> fetchBatchTests(Long batchId, TestType testType);
	Optional<BatchTestRelationEntity> fetchBatchTestsForRemove(Long batchId, Long courseId, Long testId);


	// Student Test Relation
	Boolean saveAttempt(TestStudentRelation testStudentRelation);
	Optional<TestStudentRelation> fetchTestAttempt(Long testId, Long studentId);
	Optional<TestStudentRelation> fetchTestUnAttempt(Long testId, Long studentId);


	// Roles
	Optional<List<RolesDB>> fetchAllStudentList();
	Optional<List<RolesDB>> fetchAllTeacherList();
	Optional<List<RolesDB>> fetchAllAdminList();
	Optional<List<RolesDB>> fetchAllSuperAdminList();

	Optional<List<CourseMaster>> fetchCourseMaster();


	// Student Course Enrollment
	Boolean saveAllMaterialEnrollments(List<MaterialEnrollmentDB> materialEnrollmentDBList);
	Integer fetchEnrolledCoursesCountOfStudent(String username);
	Integer countTotalEnrollmentsInCourse(Long materialId);
	Boolean deleteContent(Long contentId);


	// Feedback
	Boolean saveFeedback(FeedbackEntity feedbackEntity);


	// ContactUs
	Boolean saveContactUs(ContactUsEntity contactUsEntity);


	// Country Master
	Boolean saveCountryMaster(List<CountryMaster> countryMasterList);
	Optional<List<CountryMaster>> getCountryMaster();


	// Role Master
	Boolean saveRoleMaster(RoleMaster roleMaster);
	Optional<RoleMaster> getRoleMasterById(Long roleMasterId);
	Optional<List<RoleMaster>> getRoleMaster();
	Optional<RoleMaster> getRoleMasterByCode(String roleMasterCode);
	Optional<RoleMaster> getRoleMasterByName(String roleMasterName);
	Long countActiveUsersByRoleMasterId(Long roleMasterId);

	// Subject Master
	Optional<SubjectMasterDB> getSubject(Long subjectMasterId);
	Boolean saveSubjectMaster(SubjectMasterDB subjectMasterDB);
	Optional<List<SubjectMasterDB>> getAllSubjects();
	List<SubjectMasterDB> saveSubjectMaster(List<SubjectMasterDB> subjectMasterDB);

	// Teacher Assessments
	Optional<List<TestDB>> fetchAssessmentsByTeacherAndBatch(Long teacherId, Long batchId);
	Optional<List<SubjectiveTestSubmit>> fetchSubmissionsByTestId(Long testId);
	Boolean evaluateSubmission(SubjectiveTestSubmit evaluation);

}
