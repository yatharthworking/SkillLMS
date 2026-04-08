package com.soul.lms.admin.service;

import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.batchenrollment.BatchEnrollmentEntity;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.modelmasters.CountryMaster;
import com.soul.lms.model.entity.modelmasters.masterentitydb.BatchDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import com.soul.lms.model.entity.tests.TestDB;
import com.soul.lms.model.entity.tests.ObjectiveTestSubmit;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AdminServiceInterf {

    ResponseEntity<Map<String,Object>> courseObjectiveTestSubmit(List<ObjectiveTestSubmit> objectiveTestSubmit);

    ResponseEntity<Map<String, Object>> courseSubjectiveTestSubmit(List<SubjectiveTestSubmit> subjectiveTestSubmit);

    ResponseEntity<Map<String, Object>> enrollTutorToBatch(BatchEnrollmentEntity batchEnrollmentEntity);

    ResponseEntity<Map<String, Object>> fetchTestSubmissions(Long testId, String userName, String testPattern);

    ResponseEntity<Map<String, Object>> addAnnouncementToBatch(BatchDB announcementEntity);

    ResponseEntity<Map<String, Object>> fetchAllAnnouncements(Long branchId);

    ResponseEntity<Map<String, Object>> editAnnouncementToBatch(BatchDB announcementEntity);

    ResponseEntity<Map<String, Object>> fetchAnnouncementStudentWise(String userName, Boolean markAsRead);

    ResponseEntity<Map<String, Object>> markAnnouncementsAsRead(String userName, List<Long> announcementIds);

    ResponseEntity<Map<String,Object>> saveOrUpdateHolidayMaster(HolidayMaster holidayMaster);

    ResponseEntity<Map<String,Object>> fetchAllHolidays(Long branchId);

    ResponseEntity<Map<String, Object>> addCourseToBatch(BatchCourseRelationEntity batchCourseRelationEntity);

    ResponseEntity<Map<String, Object>> enrollStudentToBatch(BatchEnrollmentEntity batchEnrollmentEntity);
    
    ResponseEntity<List<RolesDB>> getTutorMaster();

    ResponseEntity<Map<String, Object>> fetchCoursesOfBatch(Long batchId);

    ResponseEntity<Map<String, Object>> saveNewTestMaster(TestDB testInput);

    ResponseEntity<Map<String, Object>> updateTest(TestDB testInput);
    
    ResponseEntity<Map<String, Object>> saveTestXsl(Long testId, List<TestQuestionsDB> questionsDBS);
    
    ResponseEntity<Map<String, Object>> fetchBatchEnrolledStudent(Long batchId);

    ResponseEntity<Map<String, Object>> fetchTestsByBatchForAdmin(Long batchId, String testType);

    ResponseEntity<Map<String,Object>> unEnrolledStudents(int page, int size);

    ResponseEntity<Map<String, Object>> fetchCourseMaster(Long batchId);

    ResponseEntity<Map<String, Object>> removeBatchCourseRelation(Long batchId, Long tutorId, Long courseId);

    ResponseEntity<Map<String, Object>> removeBatchTestsRelation(Long batchId, Long courseId, Long testId);

    ResponseEntity<Map<String, Object>> removeStudentBatchEnrollments(Long studentId, Long batchId);

    ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalUsers(Optional<Long> branchId);

    ResponseEntity<Map<String, Object>> fetchAdminDashboardSummary(Optional<Long> branchId);

    ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalConcerns(Optional<Long> branchId);

    ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalBatches(Optional<Long> branchId);

    ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalCourses(Optional<Long> branchId);

    ResponseEntity<Map<String, Object>> getUserMaster(String role, int page, int size);

    ResponseEntity<Map<String, Object>> fetchAdminTestsQuestions(Long testId);

    ResponseEntity<Boolean> deleteContent(Long contentId);

    ResponseEntity<Map<String, Object>> fetchAllHelpAndSupport(Long branchId, Boolean getIsResolved);

    ResponseEntity<Boolean> deleteHelpAndSupport(Long grievanceId);

    ResponseEntity<Map<String, Object>> saveCountryMaster(List<CountryMaster> countryMasterList);

    ResponseEntity<Map<String, Object>> getCountryMaster();

    ResponseEntity<Map<String, Object>> saveHolidayXsl(Long branchId, List<HolidayMaster> holidayMasterDBS);

    ResponseEntity<Map<String, Object>> getMonthlyAdminSchedules(Integer year, Integer month, Long branchId);
}
