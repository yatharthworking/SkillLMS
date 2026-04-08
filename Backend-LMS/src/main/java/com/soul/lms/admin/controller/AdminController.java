package com.soul.lms.admin.controller;

import com.soul.lms.admin.service.AdminServiceInterf;
import com.soul.lms.auth.registration.RegistrationServiceInterf;
import com.soul.lms.masters.service.MastersServiceInterf;
import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.batchenrollment.BatchEnrollmentEntity;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.liveclass.LiveClassEntity;
import com.soul.lms.model.entity.modelmasters.CountryMaster;
import com.soul.lms.model.entity.modelmasters.masterentitydb.*;
import com.soul.lms.model.entity.modelonetimepassword.graphqlentity.OneTimePasswordInput;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ResetPasswordEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import com.soul.lms.model.entity.studymaterial.AddChapterEntity;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import com.soul.lms.model.entity.studymaterial.quiz.AddQuizEntity;
import com.soul.lms.model.entity.studymaterial.quiz.QuizQuestionsDB;
import com.soul.lms.model.entity.tests.TestDB;
import com.soul.lms.model.entity.webinar.WebinarEntity;
import com.soul.lms.studymaterials.service.StudyMaterialServiceInterf;
import com.soul.lms.webinar.service.WebinarServiceInterf;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@CrossOrigin
@Validated
public class AdminController {
	private final RegistrationServiceInterf registrationServiceInterf;

	private final AdminServiceInterf adminServiceInterf;

	private final MastersServiceInterf mastersServiceInterf;

	private final WebinarServiceInterf webinarServiceInterf;

	private final StudyMaterialServiceInterf studyMaterialServiceInterf;

	@Autowired
	public AdminController(RegistrationServiceInterf registrationServiceInterf, AdminServiceInterf adminServiceInterf, MastersServiceInterf mastersServiceInterf, WebinarServiceInterf webinarServiceInterf, StudyMaterialServiceInterf studyMaterialServiceInterf) {
		super();
		this.registrationServiceInterf = registrationServiceInterf;
		this.adminServiceInterf = adminServiceInterf;
		this.mastersServiceInterf = mastersServiceInterf;
		this.webinarServiceInterf = webinarServiceInterf;
		this.studyMaterialServiceInterf = studyMaterialServiceInterf;
    }

	// POST API FOR user registration
	@PostMapping("/registration")
	ResponseEntity<UserInfoDB> createAdminInfo(@RequestBody UserInfoDB userInfoInput) {
		return registrationServiceInterf.registerUser(userInfoInput);
	}


	//This Authorization is added as one Admin can create another Admin so initially one admin will be created with default
	//password.
	@PostMapping("/send-otp")
	public ResponseEntity<Map<String, Object>> sendOTPForAdminRegistration(@RequestBody OneTimePasswordInput oneTimePasswordInput) {
		// Call your service to create the Admin
		return registrationServiceInterf.generateOtp(oneTimePasswordInput);
	}

	//This Authorization is added as one Admin can create another Admin so initially one admin will be created with default
	//password.
	@PostMapping("/verify-otp")
	public ResponseEntity<Map<String, Object>> verifyOTPForAdminRegistration(@RequestBody OneTimePasswordInput oneTimePasswordInput) {
		// Call your service to create the Admin
		return registrationServiceInterf.verifyOtp(oneTimePasswordInput);
	}

	@PatchMapping("/resetPassword")
	public ResponseEntity<Map<String,Object>> resetPassword(@RequestBody ResetPasswordEntity resetPasswordEntity){
		return registrationServiceInterf.resetPassword(resetPasswordEntity);
	}


	// GET API to fetch organizationGroups under organizationMasterId
	@GetMapping("/fetchOrganizationMaster")
	public ResponseEntity<Map<String, Object>> fetchOrganizationMaster(@RequestParam Long organizationMasterId) {
		return mastersServiceInterf.fetchOrganizationMaster(organizationMasterId);
	}

	// GET API to fetch organizationGroups under organizationMasterId
	@GetMapping("/fetchOrganizationsBranches")
	public ResponseEntity<Map<String, Object>> fetchOrganizationsBranches(@RequestParam Long organizationMasterId, @RequestParam Long userId) {
		return mastersServiceInterf.fetchOrganizationsBranches(organizationMasterId, userId);
	}

	// POST API to add and update organizationMaster and organizationGroups
	@PostMapping("/saveOrUpdateOrganization")
	public List<OrganizationMasterDB> saveOrUpdateOrganizationMaster(@RequestBody List<OrganizationMasterDB> organizationMasterDBList) {
		return mastersServiceInterf.saveOrUpdateOrganizationMaster(organizationMasterDBList);
	}


	//POST API for adding or editing webinars details
	@PostMapping("/addOrEditWebinarDetails")
	public ResponseEntity<Map<String, Object>> addOrEditWebinarDetails(@Valid @RequestBody WebinarEntity webinarEntity) {

		//Call the service method to add new Webinar details or edit existing webinar Details
		return webinarServiceInterf.addOrEditWebinarDetails(webinarEntity);
	}

	//GET API for fetching webinars
	@GetMapping("/fetchWebinarSchedules")
	public ResponseEntity<Map<String, Object>> fetchWebinarSchedules(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam (required = false) Optional<Long> subjectId) {

		//Call the service layer method to fetch list of webinars
		return webinarServiceInterf.fetchWebinarSchedules(page, size, subjectId);
	}

	//GET API for fetching students registered for webinar
	@GetMapping("/fetchStudentsRegisteredForWebinar")
	public ResponseEntity<Map<String, Object>> fetchStudentsRegisteredForWebinar(@RequestParam Long webinarInfoId) {

		//call the service layer method to fetch List of students details registered for the webinar
		return webinarServiceInterf.fetchStudentsRegisteredForWebinar(webinarInfoId);

	}

	//GET API for fetching students who attended a webinar
	@GetMapping("/fetchStudentsAttendanceForWebinar")
	public ResponseEntity<Map<String, Object>> fetchStudentsAttendanceForWebinar(@RequestParam Long webinarInfoId) {

		//call the service layer method to fetch List of students details who attended the webinar
		return webinarServiceInterf.fetchStudentsAttendanceForWebinar(webinarInfoId);

	}


	//GET API for fetching all batches
	@GetMapping("/batch/fetchAllUpcomingBatches")
	public ResponseEntity<Map<String, Object>> fetchAllUpcomingBatchesByBranch(@RequestParam Optional<Long> orgId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return mastersServiceInterf.fetchAllUpcomingBatchesByBranch(orgId, page, size);
	}
	
	//GET API for fetching all batches
	@GetMapping("/batch/fetchAllOngoingBatches")
	public ResponseEntity<Map<String, Object>> fetchAllOngoingBatchesByBranch(@RequestParam Optional<Long> orgId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return mastersServiceInterf.fetchAllOngoingBatchesByBranch(orgId, page, size);
	}

	//GET API for fetching all batches
	@GetMapping("/batch/fetchAllCompletedBatches")
	public ResponseEntity<Map<String, Object>> fetchAllCompletedBatchesByBranch(@RequestParam Optional<Long> orgId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return mastersServiceInterf.fetchAllCompletedBatchesByBranch(orgId, page, size);
	}


	// GET API for fetching students Enrolled in the batch
	@GetMapping("/fetchAllStudentEnrollmentsByBatch")
	public ResponseEntity<Map<String, Object>> fetchAllStudentEnrollmentsByBatch(@RequestParam Long batchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return mastersServiceInterf.fetchAllStudentEnrollmentsByBatchId(batchId, page, size);
	}


	// GET API for fetching tutors Enrolled in the batch
	@GetMapping("/fetchAllTutorEnrollmentsByBatch")
	public ResponseEntity<Map<String, Object>> fetchAllTutorEnrollmentsByBatch(@RequestParam Long batchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return mastersServiceInterf.fetchAllTutorEnrollmentsByBatchId(batchId, page, size);
	}


//	// GET API for fetching Announcements in the batch
//	@GetMapping("/fetchAllAnnouncementsByBatch")
//	public ResponseEntity<Map<String, Object>> fetchAllAnnouncementsByBatch(@RequestParam Long batchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
//		return mastersServiceInterf.fetchAllAnnouncementsByBatchId(batchId, page, size);
//	}


	//GET API for fetching batches with orgId
	@GetMapping("/fetchBatchByOrgId")
	public ResponseEntity<Map<String, Object>> fetchAllBatchesByOrganizations(@RequestParam Optional<Long> orgId) {
		return mastersServiceInterf.fetchAllBatchesByOrganizations(orgId);
	}


	//GET API for fetching test submission with testId
	@PostMapping("/saveOrUpdateBatches")
	public ResponseEntity<Map<String, Object>> saveOrUpdateBatchMaster(@RequestBody BatchDB batchInput) {
		return mastersServiceInterf.saveOrUpdateBatchMaster(batchInput);
	}

	//POST API for Adding quiz question and answers
	@PostMapping("/addQuizInChapter")
	public ResponseEntity<Map<String, Object>> saveQuizDetails(@RequestBody AddQuizEntity addQuizEntity) {
		return studyMaterialServiceInterf.saveQuizDetails(addQuizEntity);
	}
	
	//PATCH API for updating quiz question and answers
	@PatchMapping("/editQuestion")
	public ResponseEntity<Map<String, Object>> editQuestion(@RequestBody QuizQuestionsDB addQuizEntity) {
		return studyMaterialServiceInterf.editQuestion(addQuizEntity);
	}

	//POST API for adding/editing content in a chapter
	@PostMapping("/addOrEditContentInChapter")
	public ResponseEntity<Map<String, Object>> saveContentDetails(@RequestPart("binaryFile") MultipartFile binaryFile, @RequestParam Long chapterId, @RequestParam(required = false) Optional<Long> contentId) throws IOException {
		return studyMaterialServiceInterf.saveContentDetails(binaryFile, chapterId, contentId);
	}


	//POST API for Adding/editing chapter in a material
	@PostMapping("/addOrEditChapterInMaterial")
	public ResponseEntity<Map<String, Object>> saveChapterDetails(@RequestBody AddChapterEntity addChapterEntity) {
		return studyMaterialServiceInterf.saveChapterDetails(addChapterEntity);
	}

	// GET API for fetching chapters list
	@GetMapping("/getChaptersList")
	public ResponseEntity<Map<String, Object>> getChaptersList(@RequestParam Long materialId){
		return studyMaterialServiceInterf.getChaptersList(materialId);
	}

	// PUT API to delete a question
	@PutMapping("/deleteQuestion")
	public ResponseEntity<Boolean> deleteQuestion(@RequestParam Long questionId){
		return studyMaterialServiceInterf.deleteQuizQuestion(questionId);
	}

	//POST API for adding/editing material in Library
	@PostMapping("/addOrEditMaterialInLibrary")
	public ResponseEntity<Map<String, Object>> saveMaterialDetails(@RequestBody LibraryMasterDB libraryMasterDB) {
		return studyMaterialServiceInterf.saveMaterialDetails(libraryMasterDB);
	}


	@PostMapping("/enrollTutorToBatch")
	public ResponseEntity<Map<String, Object>> enrollTutorToBatch(@RequestBody @Valid BatchEnrollmentEntity batchEnrollmentEntity) {
		return adminServiceInterf.enrollTutorToBatch(batchEnrollmentEntity);
	}


	// Resolve for help and support
	@PostMapping("/resolveHelpAndSupport")
	public ResponseEntity<Map<String, Object>> SubmitHelpResponse(@RequestBody HelpAndSupportEntity helpAndSupportEntity) {
		return registrationServiceInterf.saveOrUpdateHelpAndSupport(helpAndSupportEntity);
	}

	@GetMapping("/fetchAllHelpAndSupport")
	public ResponseEntity<Map<String, Object>> fetchAllHelpAndSupport(@RequestParam(required = false) Long branchId, @RequestParam Boolean isResolved) {
		return adminServiceInterf.fetchAllHelpAndSupport(branchId, isResolved);
	}

	@DeleteMapping("/deleteHelpAndSupport")
	public ResponseEntity<Boolean> deleteHelpAndSupport(@RequestParam Long grievanceId) {
		return adminServiceInterf.deleteHelpAndSupport(grievanceId);
	}


	@PostMapping("/addAnnouncementToBatch")
	public ResponseEntity<Map<String, Object>> addAnnouncementToBatch(@RequestBody BatchDB announcementEntity) {
		return adminServiceInterf.addAnnouncementToBatch(announcementEntity);
	}

	@GetMapping("/fetchAllAnnouncements")
	public ResponseEntity<Map<String, Object>> fetchAllAnnouncements(@RequestParam(required = false) Long branchId) {
		return adminServiceInterf.fetchAllAnnouncements(branchId);
	}

	@PostMapping("/editAnnouncementToBatch")
	public ResponseEntity<Map<String, Object>> editAnnouncementToBatch(@RequestBody BatchDB announcementEntity) {
		return adminServiceInterf.editAnnouncementToBatch(announcementEntity);
	}

	//PATCH API to toggle material Active status
	@PatchMapping("/toggleMaterialActiveStatus")
	public ResponseEntity<Map<String, Object>> toggleMaterialActiveStatus(@RequestParam Long materialId, @RequestParam Boolean status) {
		return studyMaterialServiceInterf.toggleMaterialActiveStatus(materialId, status);
	}

	//PATCH API to toggle chapter Active status
	@PatchMapping("/toggleChapterActiveStatus")
	public ResponseEntity<Map<String, Object>> toggleChapterActiveStatus(@RequestParam Long chapterId, @RequestParam Boolean status) {
		return studyMaterialServiceInterf.toggleChapterActiveStatus(chapterId, status);
	}

	//PATCH API to toggle quiz Active status
	@PatchMapping("/toggleQuizActiveStatus")
	public ResponseEntity<Map<String, Object>> toggleQuizActiveStatus(@RequestParam Long quizId, @RequestParam Boolean status) {
		return studyMaterialServiceInterf.toggleQuizActiveStatus(quizId, status);
	}

	//PATCH API to toggle webinar Active Status
	@PatchMapping("/toggleWebinarActiveStatus")
	public ResponseEntity<Map<String, Object>> toggleWebinarActiveStatus(@RequestParam Long webinarInfoId, @RequestParam Boolean status) {
		return webinarServiceInterf.toggleWebinarActiveStatus(webinarInfoId, status);
	}

	@PostMapping("saveOrUpdateHolidayMaster")
	public ResponseEntity<Map<String, Object>> saveOrUpdateHolidayMaster(@RequestBody HolidayMaster holidayMaster) {
		return adminServiceInterf.saveOrUpdateHolidayMaster(holidayMaster);
	}

	@GetMapping("/fetchAllHolidays")
	public ResponseEntity<Map<String, Object>> fetchAllHolidays(@RequestParam Long branchId) {
		return adminServiceInterf.fetchAllHolidays(branchId);
	}

	//User Master
	@GetMapping("/getUserMaster")
	public ResponseEntity<Map<String, Object>> getUserMaster(@RequestParam String role, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return adminServiceInterf.getUserMaster(role, page, size);
	}

	// Save and Update LiveClasses
	@PostMapping("/saveOrUpdateLiveClass")
	public ResponseEntity<Map<String, Object>> saveOrUpdateLiveClasses(@RequestBody LiveClassEntity liveClassEntity) {
		return mastersServiceInterf.saveOrUpdateLiveClasses(liveClassEntity);
	}


	//POST API to enroll students to batches
	@PostMapping("/enrollStudentToBatch")
	public ResponseEntity<Map<String, Object>> enrollStudentToBatch(@RequestBody @Valid BatchEnrollmentEntity batchEnrollmentEntity) {
		return adminServiceInterf.enrollStudentToBatch(batchEnrollmentEntity);
	}

	// POST API to add a course to a particular batch
	@PostMapping("/addCourseToBatch")
	public ResponseEntity<Map<String, Object>> addCourseToBatch(@RequestBody BatchCourseRelationEntity batchCourseRelationEntity) {
		return adminServiceInterf.addCourseToBatch(batchCourseRelationEntity);
	}

	// GET Tutor Master
	@GetMapping("/getTutorMaster")
	public ResponseEntity<List<RolesDB>> getTutorMaster() {
		return adminServiceInterf.getTutorMaster();
	}


	//GET API To fetch all courses(admin side)
	@GetMapping("/fetchAllCourses")
	public ResponseEntity<Map<String, Object>> fetchAllCourses(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return studyMaterialServiceInterf.fetchAllCourses(page, size);
	}

	//GET API To get details regarding courses based on Id
	@GetMapping("/getCourseMaterialById")
	public ResponseEntity<Map<String,Object>> getCourseMaterialById(@RequestParam Long materialId){
		return studyMaterialServiceInterf.getCourseMaterialById(materialId);
	}

	//PATCH API to publish to course to students
	@PatchMapping("/publishCourseToStudents")
	public ResponseEntity<Map<String,Object>> publishCourseToStudents(@RequestParam Long materialId){
		return studyMaterialServiceInterf.publishCourseToStudents(materialId);
	}

	// GET for fetching Courses taught in a particular batch
	@GetMapping("/fetchCoursesOfBatch")
	public ResponseEntity<Map<String, Object>> fetchCoursesOfBatch(@RequestParam(name = "batchId") Long batchId) {
		return adminServiceInterf.fetchCoursesOfBatch(batchId);
	}

	// GET for fetching Enrolled Student Details
	@GetMapping("/fetchBatchEnrolledStudents")
	public ResponseEntity<Map<String, Object>> fetchBatchEnrolledStudents(@RequestParam(name = "batchId") Long batchId) {
		return adminServiceInterf.fetchBatchEnrolledStudent(batchId);
	}

	// add tests
	@PostMapping("/addTestMaster")
	public ResponseEntity<Map<String, Object>> saveNewTestMaster(@RequestBody TestDB testInput) {
		return adminServiceInterf.saveNewTestMaster(testInput);
	}

	// update tests
	@PostMapping("/updateTests")
	public ResponseEntity<Map<String, Object>> updateTest(@RequestBody TestDB testInput) {
		return adminServiceInterf.updateTest(testInput);
	}

	// fetch test batchWise
	@GetMapping("/fetchBatchTest")
	public ResponseEntity<Map<String, Object>> fetchTestsByBatchForAdmin(@RequestParam Long batchId,@RequestParam String testType) {
		return adminServiceInterf.fetchTestsByBatchForAdmin(batchId, testType);
	}

	// Get for fetching Tests Questions
	@GetMapping("/fetchTestQuestions")
	public ResponseEntity<Map<String, Object>> fetchAdminTestsQuestions(@RequestParam Long testId){
		return adminServiceInterf.fetchAdminTestsQuestions(testId);
	}

	// remove batch assigned tests
	@PostMapping("/removeBatchTests")
	public ResponseEntity<Map<String, Object>> removeBatchTestsRelation(Long batchId, Long courseId, Long testId) {
		return adminServiceInterf.removeBatchTestsRelation(batchId,courseId,testId);
	}


	// fetch un-enrolled students
	@GetMapping("/fetchUnEnrolledStudents")
	public ResponseEntity<Map<String, Object>> unEnrolledStudents(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
		return adminServiceInterf.unEnrolledStudents(page,size);
	}


	// remove batch assigned courses
	@PostMapping("/removeBatchCourses")
	public ResponseEntity<Map<String, Object>> removeBatchCourseRelation(@RequestParam Long batchId,@RequestParam(name = "assignedTutorId") Long tutorId,@RequestParam Long courseId) {
		return adminServiceInterf.removeBatchCourseRelation(batchId,tutorId,courseId);
	}

	// remove student from batch assigned
	@PostMapping("/removeStudentFromBatch")
	public ResponseEntity<Map<String, Object>> removeStudentBatchEnrollments(Long studentId, Long batchId) {
		return adminServiceInterf.removeStudentBatchEnrollments(studentId,batchId);
	}


	@GetMapping("/dashboard/totalUsers")
	public ResponseEntity<Map<String, Object>> removeStudentBatchEnrollments(@RequestParam(required = false) Optional<Long> branchId) {
		return adminServiceInterf.fetchAdminDashboardTotalUsers(branchId);
	}

	@GetMapping("/dashboard/summary")
	public ResponseEntity<Map<String, Object>> fetchAdminDashboardSummary(@RequestParam(required = false) Optional<Long> branchId) {
		return adminServiceInterf.fetchAdminDashboardSummary(branchId);
	}


	@GetMapping("/dashboard/totalConcerns")
	public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalConcerns(@RequestParam(required = false) Optional<Long> branchId) {
		return adminServiceInterf.fetchAdminDashboardTotalConcerns(branchId);
	}


	@GetMapping("/dashboard/totalBatches")
	public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalBatches(@RequestParam(required = false) Optional<Long> branchId) {
		return adminServiceInterf.fetchAdminDashboardTotalBatches(branchId);
	}


	@GetMapping("/dashboard/totalCourses")
	public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalCourses(@RequestParam(required = false) Optional<Long> branchId) {
		return adminServiceInterf.fetchAdminDashboardTotalCourses(branchId);
	}

	@PatchMapping("/save-updateUserDetails")
	public ResponseEntity<Map<String,Object>> updateUserDetails(@RequestBody UserInfoDB userDetailsEntity){
		return registrationServiceInterf.saveOrUpdateUserDetails(userDetailsEntity);
	}

	// PUT API to delete content of a chapter
	@PutMapping("/deleteContent")
	public ResponseEntity<Boolean> deleteContent(@RequestParam Long contentId){
		return adminServiceInterf.deleteContent(contentId);
	}

	@GetMapping("/fetchUserDetails")
	public ResponseEntity<UserInfoDB> fetchUserDetails(@RequestParam String email){
		return registrationServiceInterf.fetchUserDetails(email);
	}

	// POST API to save country master
	@PostMapping("/saveCountryMaster")
	public ResponseEntity<Map<String, Object>> saveCountryMaster(@RequestBody List<CountryMaster> countryMasterList){
		return adminServiceInterf.saveCountryMaster(countryMasterList);
	}

	// GET API to fetch country master
	@GetMapping("/getCountryMaster")
	public ResponseEntity<Map<String, Object>> getCountryMaster(){
		return adminServiceInterf.getCountryMaster();
	}


	@PostMapping("/saveOrUpdateRoleMaster")
	public ResponseEntity<Map<String, Object>> saveOrUpdateRoleMaster(@RequestBody RoleMaster roleMaster){
		return mastersServiceInterf.saveOrUpdateRoleMaster(roleMaster);
	}


	@GetMapping("/fetchRoleMaster")
	public ResponseEntity<Map<String, Object>> fetchRoleMaster(){
		return mastersServiceInterf.fetchRoleMaster();
	}


	// GET API to save subject master
	@PostMapping("/addSubjectMaster")
	public ResponseEntity<Map<String, Object>> addOrEditSubjectMaster(@RequestBody SubjectMasterDB subjectMasterDB){
		return mastersServiceInterf.addOrEditSubjectMaster(subjectMasterDB);
	}

	@GetMapping("/getMonthlyAdminSchedules")
	public ResponseEntity<Map<String, Object>> getMonthlyAdminSchedules(@RequestParam Integer year, @RequestParam Integer month, @RequestParam Long branchId) {
		return adminServiceInterf.getMonthlyAdminSchedules(year, month, branchId);
	}
}
