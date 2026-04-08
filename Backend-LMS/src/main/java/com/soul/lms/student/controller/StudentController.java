package com.soul.lms.student.controller;

import com.soul.lms.admin.service.AdminServiceInterf;
import com.soul.lms.auth.registration.RegistrationServiceInterf;
import com.soul.lms.model.entity.certificate.CertificateMasterDB;
import com.soul.lms.model.entity.feedback.FeedbackEntity;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ForgotPasswordEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.tests.ObjectiveTestSubmit;
import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.modelonetimepassword.graphqlentity.OneTimePasswordInput;
import com.soul.lms.model.entity.modelregistration.graphqlentity.ResetPasswordEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.studymaterial.PurchaseMaterialEntity;
import com.soul.lms.student.service.StudentServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/student")
@CrossOrigin
public class StudentController
{
	private final RegistrationServiceInterf registrationServiceInterf;

    private final StudentServiceInterf studentServiceInterf;

    private final AdminServiceInterf adminServiceInterf;

	@Autowired
	public StudentController(RegistrationServiceInterf registrationServiceInterf, StudentServiceInterf studentServiceInterf, AdminServiceInterf adminServiceInterf){
		super();
        this.registrationServiceInterf = registrationServiceInterf;
        this.studentServiceInterf = studentServiceInterf;
        this.adminServiceInterf = adminServiceInterf;
    }

    @PostMapping("/create-user")
    public ResponseEntity<UserInfoDB> createUserInfo(@RequestBody UserInfoDB userInfoInput) {
        // Call your service to create the student
        return registrationServiceInterf.registerUser(userInfoInput);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map <String, Object>> sendOTP(@RequestBody OneTimePasswordInput oneTimePasswordInput) {
        // Call your service to create the student
        return registrationServiceInterf.generateOtp(oneTimePasswordInput);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody OneTimePasswordInput oneTimePasswordInput){
        return registrationServiceInterf.verifyOtp(oneTimePasswordInput);
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody ForgotPasswordEntity forgotPasswordEntity){
        return registrationServiceInterf.forgotPassword(forgotPasswordEntity);
    }


    @GetMapping("/fetchUserDetails")
    public ResponseEntity<UserInfoDB> fetchUserDetails(@RequestParam String email){
        return registrationServiceInterf.fetchUserDetails(email);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserInfoDB> fetchProfile(@RequestParam String email){
        return registrationServiceInterf.fetchUserDetails(email);
    }

    @PatchMapping("/save-updateUserDetails")
    public ResponseEntity<Map<String,Object>> updateUserDetails(@RequestBody UserInfoDB userDetailsEntity){
        return registrationServiceInterf.saveOrUpdateUserDetails(userDetailsEntity);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String,Object>> updateProfile(@RequestBody UserInfoDB userDetailsEntity){
        return registrationServiceInterf.saveOrUpdateUserDetails(userDetailsEntity);
    }

    // Get for fetching Tests of courses in which student is enrolled
    @GetMapping("/fetchUpcomingTests")
    public ResponseEntity<Map<String, Object>> fetchUpcomingStudentTests(@RequestParam Long batchId, @RequestParam String userName, @RequestParam String testType){
        return studentServiceInterf.fetchUpcomingStudentTests(batchId, userName, testType);
    }


    // Get for fetching Attempted Tests of courses in which student is enrolled
    @GetMapping("/fetchAttemptedTests")
    public ResponseEntity<Map<String, Object>> fetchAttemptedStudentTests(@RequestParam Long batchId, @RequestParam String userName, @RequestParam String testType){
        return studentServiceInterf.fetchAttemptedStudentTests(batchId, userName, testType);
    }


    // Get for fetching UnAttempted Tests of courses in which student is enrolled
    @GetMapping("/fetchUnAttemptedTests")
    public ResponseEntity<Map<String, Object>> fetchUnAttemptedStudentTests(@RequestParam Long batchId, @RequestParam String userName, @RequestParam String testType){
        return studentServiceInterf.fetchUnAttemptedStudentTests(batchId, userName, testType);
    }


    @PatchMapping("/resetPassword")
    public ResponseEntity<Map<String,Object>> resetPassword(@RequestBody ResetPasswordEntity resetPasswordEntity){
        return registrationServiceInterf.resetPassword(resetPasswordEntity);
    }


    @GetMapping("/fetchBatchEnrollments")
    public ResponseEntity<Map<String, Object>> fetchEnrolledBatches(@RequestParam String userName){
        return studentServiceInterf.fetchEnrolledBatches(userName);
    }

    //GET API to fetch certificates of the student
    @GetMapping("/fetchCertificates")
    public ResponseEntity<List<CertificateMasterDB>> fetchCertificates(@RequestParam String username){
        return studentServiceInterf.fetchCertificates(username);
    }

    // Get for fetching Tests Questions
    @GetMapping("/fetchTestQuestions")
    public ResponseEntity<Map<String, Object>> fetchStudentTestsQuestions(@RequestParam Long testId){
        return studentServiceInterf.fetchStudentTestsQuestions(testId);
    }

    @GetMapping("/tests")
    public ResponseEntity<Map<String, Object>> fetchExamTests(@RequestParam Long batchId,
                                                              @RequestParam String userName,
                                                              @RequestParam(defaultValue = "LIVE_TEST") String testType){
        return studentServiceInterf.fetchExamTests(batchId, userName, testType);
    }

    @GetMapping("/test/{testId}")
    public ResponseEntity<Map<String, Object>> fetchExamTestDetails(@PathVariable Long testId){
        return studentServiceInterf.fetchExamTestDetails(testId);
    }

    // POST API to save answers to DB
    @PostMapping("/submitCourseObjectiveTest")
    public ResponseEntity<Map<String, Object>> objectiveTestSubmit(@RequestBody List<ObjectiveTestSubmit> objectiveTestSubmit) {
        return adminServiceInterf.courseObjectiveTestSubmit(objectiveTestSubmit);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitExam(@RequestBody List<ObjectiveTestSubmit> objectiveTestSubmit) {
        return adminServiceInterf.courseObjectiveTestSubmit(objectiveTestSubmit);
    }

    // POST API to save answers to DB
    @PostMapping("/submitCourseSubjectiveTest")
    public ResponseEntity<Map<String, Object>> testSubmit(@RequestBody List<SubjectiveTestSubmit> subjectiveTestSubmit) {
        return adminServiceInterf.courseSubjectiveTestSubmit(subjectiveTestSubmit);
    }

    // Post for help and support
    @PostMapping("/submitHelpAndSupport")
    public ResponseEntity<Map<String, Object>> SubmitHelpResponse(@RequestBody HelpAndSupportEntity helpAndSupportEntity) {
        return registrationServiceInterf.saveOrUpdateHelpAndSupport(helpAndSupportEntity);
    }

    @PostMapping("/issue")
    public ResponseEntity<Map<String, Object>> submitIssue(@RequestBody HelpAndSupportEntity helpAndSupportEntity) {
        return registrationServiceInterf.saveOrUpdateHelpAndSupport(helpAndSupportEntity);
    }

    @GetMapping("/fetchHelpForUsername")
    public ResponseEntity<Map<String,Object>> fetchHelpAndSupportStudentWise(@RequestParam String userName){
        return studentServiceInterf.fetchHelpAndSupportStudentWise(userName);
    }

    @GetMapping("/issues")
    public ResponseEntity<Map<String,Object>> fetchIssues(@RequestParam String userName){
        return studentServiceInterf.fetchHelpAndSupportStudentWise(userName);
    }

    @GetMapping("/faqs")
    public ResponseEntity<Map<String, Object>> fetchSupportFaqs() {
        return studentServiceInterf.fetchSupportFaqs();
    }

    @GetMapping("/fetchAnnouncements")
    public ResponseEntity<Map<String,Object>> fetchAnnouncementStudentWise(@RequestParam String userName, @RequestParam Boolean markAsRead){
        return adminServiceInterf.fetchAnnouncementStudentWise(userName, markAsRead);
    }

    @PostMapping("/markAnnouncementsAsRead")
    public ResponseEntity<Map<String,Object>> markAnnouncementAsRead(@RequestParam String userName, @RequestParam List<Long> announcementId){
        return adminServiceInterf.markAnnouncementsAsRead(userName, announcementId);
    }

    @GetMapping("/fetch-live-classes")
	public ResponseEntity<Map<String, Object>> fetchLiveClasses(@RequestParam String userName, @RequestParam @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date)
	{
		return studentServiceInterf.fetchStudentLiveClasses(userName, date);
	}

    // Get Courses added to batch
    @GetMapping("/getBatchCourses")
    public ResponseEntity<Map<String, Object>> getBatchCourses(@RequestParam Long batchId){
        return studentServiceInterf.getBatchCourses(batchId);
    }

    // Fetching Course Master
    @GetMapping("/fetchCourseMaster")
    public ResponseEntity<Map<String, Object>> fetchCourseMaster(@RequestParam Long batchId){
        return adminServiceInterf.fetchCourseMaster(batchId);
    }

    // GET Tutor Master
    @GetMapping("/getTutorMaster")
    public ResponseEntity<List<RolesDB>> getTutorMaster(){
        return adminServiceInterf.getTutorMaster();
    }


    // GET Batch Info in which student is enrolled
    @GetMapping("/getBatchInfo")
    public ResponseEntity<Map<String, Object>> getBatchInfo(@RequestParam Long studentId, @RequestParam Long organizationId){
        return studentServiceInterf.getBatchInfo(studentId, organizationId);
    }


    // GET Schedules for the students
    @GetMapping("/getStudentSchedules")
    public ResponseEntity<Map<String,Object>> fetchAllSchedules(@RequestParam String userName, @RequestParam @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date, @RequestParam Long batchId){
        return studentServiceInterf.fetchAllSchedules(userName, date, batchId);
    }


    // GET Monthly Schedules for the student's calendar
    @GetMapping("/getMonthlyStudentSchedules")
    public ResponseEntity<Map<String,Object>> fetchMonthlySchedules(@RequestParam String userName, @RequestParam Integer year, @RequestParam Integer month, @RequestParam Long batchId){
        return studentServiceInterf.fetchMonthlySchedules(userName, year, month, batchId);
    }

    //GET API for fetching test submission with testId
    @GetMapping("/fetchSubmission")
    public ResponseEntity<Map<String, Object>> getTestWithAnswers(@RequestParam Long testId, @RequestParam String username, @RequestParam String testPattern) {
        return adminServiceInterf.fetchTestSubmissions(testId, username, testPattern);
    }

    @GetMapping("/result/{testId}")
    public ResponseEntity<Map<String, Object>> fetchExamResult(@PathVariable Long testId,
                                                               @RequestParam String userName,
                                                               @RequestParam(defaultValue = "OBJECTIVE") String testPattern) {
        return studentServiceInterf.fetchExamResult(testId, userName, testPattern);
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> fetchResultsHistory(@RequestParam Long batchId,
                                                                   @RequestParam String userName,
                                                                   @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchResultsHistory(batchId, userName, testType);
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> fetchPerformanceOverview(@RequestParam Long batchId,
                                                                        @RequestParam String userName,
                                                                        @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchPerformanceOverview(batchId, userName, testType);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> fetchDashboardSummary(@RequestParam String userName,
                                                                     @RequestParam(required = false) Long batchId,
                                                                     @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchDashboardSummary(userName, batchId, testType);
    }

    @GetMapping("/my-courses/overview")
    public ResponseEntity<Map<String, Object>> fetchMyCoursesOverview(@RequestParam String userName,
                                                                      @RequestParam(required = false) Long batchId,
                                                                      Authentication authentication) {
        String resolvedUserName = resolveAuthorizedStudentUserName(userName, authentication);
        if (resolvedUserName == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "You are not allowed to access another student's courses"
            ));
        }
        return studentServiceInterf.fetchMyCoursesOverview(resolvedUserName, batchId);
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> fetchStudentCourses(@RequestParam String userName,
                                                                   @RequestParam(required = false) Long batchId,
                                                                   Authentication authentication) {
        String resolvedUserName = resolveAuthorizedStudentUserName(userName, authentication);
        if (resolvedUserName == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "You are not allowed to access another student's courses"
            ));
        }
        return studentServiceInterf.fetchMyCoursesOverview(resolvedUserName, batchId);
    }

    @GetMapping("/skill-programs")
    public ResponseEntity<Map<String, Object>> fetchStudentSkillPrograms(@RequestParam String userName,
                                                                         @RequestParam(required = false) Long batchId,
                                                                         Authentication authentication) {
        String resolvedUserName = resolveAuthorizedStudentUserName(userName, authentication);
        if (resolvedUserName == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "You are not allowed to access another student's skill programs"
            ));
        }
        return studentServiceInterf.fetchStudentSkillPrograms(resolvedUserName, batchId);
    }

    @PostMapping("/courses/enroll")
    public ResponseEntity<Map<String, Object>> enrollInCourse(@RequestParam String userName,
                                                              @RequestParam(required = false) Long batchId,
                                                              @RequestBody PurchaseMaterialEntity purchaseMaterialEntity,
                                                              Authentication authentication) {
        String resolvedUserName = resolveAuthorizedStudentUserName(userName, authentication);
        if (resolvedUserName == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "You are not allowed to enroll another student's courses"
            ));
        }
        return studentServiceInterf.enrollInCourse(resolvedUserName, batchId, purchaseMaterialEntity);
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> fetchStudentProgress(@RequestParam String userName,
                                                                    @RequestParam(required = false) Long batchId,
                                                                    @RequestParam(defaultValue = "LIVE_TEST") String testType,
                                                                    Authentication authentication) {
        String resolvedUserName = resolveAuthorizedStudentUserName(userName, authentication);
        if (resolvedUserName == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "You are not allowed to access another student's progress"
            ));
        }
        return studentServiceInterf.fetchDashboardSummary(resolvedUserName, batchId, testType);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> fetchStudentSummary(@RequestParam String userName,
                                                                   @RequestParam(required = false) Long batchId,
                                                                   @RequestParam(defaultValue = "LIVE_TEST") String testType,
                                                                   Authentication authentication) {
        String resolvedUserName = resolveAuthorizedStudentUserName(userName, authentication);
        if (resolvedUserName == null) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "You are not allowed to access another student's summary"
            ));
        }
        return studentServiceInterf.fetchDashboardSummary(resolvedUserName, batchId, testType);
    }

    @GetMapping("/subjects-performance")
    public ResponseEntity<Map<String, Object>> fetchSubjectPerformance(@RequestParam Long batchId,
                                                                       @RequestParam String userName,
                                                                       @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchSubjectPerformance(batchId, userName, testType);
    }

    @GetMapping("/ai-recommendations")
    public ResponseEntity<Map<String, Object>> fetchAiRecommendations(@RequestParam Long batchId,
                                                                      @RequestParam String userName,
                                                                      @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchAiRecommendations(batchId, userName, testType);
    }

    @GetMapping("/weak-topics")
    public ResponseEntity<Map<String, Object>> fetchWeakTopics(@RequestParam Long batchId,
                                                               @RequestParam String userName,
                                                               @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchWeakTopics(batchId, userName, testType);
    }

    @GetMapping("/learning-path")
    public ResponseEntity<Map<String, Object>> fetchLearningPath(@RequestParam Long batchId,
                                                                 @RequestParam String userName,
                                                                 @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchLearningPath(batchId, userName, testType);
    }

    @GetMapping("/competitive/modules")
    public ResponseEntity<Map<String, Object>> fetchCompetitiveModules(@RequestParam Long batchId,
                                                                       @RequestParam String userName,
                                                                       @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchCompetitiveModules(batchId, userName, testType);
    }

    @GetMapping("/competitive/leaderboard")
    public ResponseEntity<Map<String, Object>> fetchCompetitiveLeaderboard(@RequestParam Long batchId,
                                                                           @RequestParam String userName,
                                                                           @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchCompetitiveLeaderboard(batchId, userName, testType);
    }

    @GetMapping("/competitive/user-rank")
    public ResponseEntity<Map<String, Object>> fetchCompetitiveUserRank(@RequestParam Long batchId,
                                                                        @RequestParam String userName,
                                                                        @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchCompetitiveUserRank(batchId, userName, testType);
    }

    @PostMapping("/competitive/attempt-test")
    public ResponseEntity<Map<String, Object>> attemptCompetitiveTest(@RequestBody List<ObjectiveTestSubmit> objectiveTestSubmit) {
        return adminServiceInterf.courseObjectiveTestSubmit(objectiveTestSubmit);
    }


    @PostMapping("/saveFeedback")
    public ResponseEntity<Map<String, Object>> saveFeedback(@RequestBody FeedbackEntity feedbackEntity){
        return studentServiceInterf.saveFeedback(feedbackEntity);
    }

    @GetMapping("/learning-history")
    public ResponseEntity<Map<String, Object>> fetchLearningHistory(@RequestParam String userName,
                                                                    @RequestParam(required = false) Long batchId,
                                                                    @RequestParam(defaultValue = "LIVE_TEST") String testType) {
        return studentServiceInterf.fetchLearningHistory(userName, batchId, testType);
    }

    private String resolveAuthorizedStudentUserName(String requestedUserName, Authentication authentication) {
        if (requestedUserName == null || requestedUserName.isBlank() || authentication == null || authentication.getName() == null) {
            return null;
        }

        boolean elevatedRole = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .anyMatch(role -> "ADMIN".equals(role) || "SUPER_ADMIN".equals(role) || "TEACHER".equals(role));

        if (elevatedRole) {
            return requestedUserName.trim();
        }

        if (authentication.getName().trim().equalsIgnoreCase(requestedUserName.trim())) {
            return authentication.getName().trim();
        }

        return null;
    }
}
