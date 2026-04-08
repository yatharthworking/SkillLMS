package com.soul.lms.student.service;

import com.soul.lms.model.entity.certificate.CertificateMasterDB;
import com.soul.lms.model.entity.feedback.FeedbackEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.ImageUploadInput;
import com.soul.lms.model.entity.studymaterial.PurchaseMaterialEntity;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface StudentServiceInterf {

    ResponseEntity<Map<String, Object>> fetchEnrolledBatches(String userName);
    
    ResponseEntity<List <CertificateMasterDB>> fetchCertificates(String username);

    ResponseEntity<Map<String, Object>> fetchStudentLiveClasses(String userName, LocalDate date);

    ResponseEntity<Map<String, Object>> getBatchCourses(Long batchId);

    ResponseEntity<Map<String, Object>> fetchUpcomingStudentTests(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchAttemptedStudentTests(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchStudentTestsQuestions(Long testId);

    ResponseEntity<Map<String, Object>> fetchExamTests(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchExamTestDetails(Long testId);

    ResponseEntity<Map<String, Object>> fetchExamResult(Long testId, String userName, String testPattern);

    ResponseEntity<Map<String, Object>> fetchResultsHistory(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchPerformanceOverview(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchSubjectPerformance(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchAiRecommendations(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchWeakTopics(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchLearningPath(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchCompetitiveModules(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchCompetitiveLeaderboard(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchCompetitiveUserRank(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchUnAttemptedStudentTests(Long batchId, String userName, String testTypeString);

    ResponseEntity<Map<String, Object>> getBatchInfo(Long studentId, Long organizationId);

    ResponseEntity<Map<String, Object>> fetchAllSchedules(String userName, LocalDate date, Long batchId);

    ResponseEntity<Map<String, Object>> fetchMonthlySchedules(String userName, Integer year, Integer month, Long batchId);

    ResponseEntity<Map<String,Object>> saveFeedback(FeedbackEntity feedbackEntity);

    ResponseEntity<Map<String, Object>> fetchHelpAndSupportStudentWise(String userName);

    ResponseEntity<Map<String, Object>> fetchSupportFaqs();

    ResponseEntity<Map<String, Object>> fetchLearningHistory(String userName, Long batchId, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchDashboardSummary(String userName, Long batchId, String testTypeString);

    ResponseEntity<Map<String, Object>> fetchMyCoursesOverview(String userName, Long batchId);

    ResponseEntity<Map<String, Object>> fetchStudentSkillPrograms(String userName, Long batchId);

    ResponseEntity<Map<String, Object>> enrollInCourse(String userName, Long batchId, PurchaseMaterialEntity purchaseMaterialEntity);
}
