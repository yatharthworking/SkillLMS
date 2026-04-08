package com.soul.lms.teacher.service;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import com.soul.lms.model.entity.tests.TestDB;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TeacherAssessmentService implements TeacherAssessmentServiceInterf {

    private final LmsDaoInterf lmsDao;

    public TeacherAssessmentService(LmsDaoInterf lmsDao) {
        this.lmsDao = lmsDao;
    }

    @Override
    public ResponseEntity<Map<String, Object>> createAssessment(TestDB testDB, Long teacherId) {
        Map<String, Object> response = new HashMap<>();
        try {
            testDB.setCreatedBy(teacherId);
            testDB.setCreationTimeStamp(LocalDateTime.now());
            testDB.setIsActive(true);
            
            // Link questions to the test
            if (testDB.getTestQuestionsDB() != null) {
                for (TestQuestionsDB q : testDB.getTestQuestionsDB()) {
                    q.setTestDB(testDB);
                }
            }

            TestDB savedTest = lmsDao.saveTestMaster(testDB);
            response.put("status", true);
            response.put("message", "Assessment created successfully");
            response.put("testId", savedTest.getTestId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", "Error creating assessment: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getAssessments(Long teacherId, Long batchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<List<TestDB>> tests = lmsDao.fetchAssessmentsByTeacherAndBatch(teacherId, batchId);
            response.put("status", true);
            response.put("assessments", tests.orElse(Collections.emptyList()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getSubmissions(Long testId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<List<SubjectiveTestSubmit>> submissions = lmsDao.fetchSubmissionsByTestId(testId);
            response.put("status", true);
            response.put("submissions", submissions.orElse(Collections.emptyList()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> evaluateSubmission(SubjectiveTestSubmit evaluation) {
        Map<String, Object> response = new HashMap<>();
        try {
            Boolean success = lmsDao.evaluateSubmission(evaluation);
            response.put("status", success);
            response.put("message", success ? "Submission evaluated successfully" : "Failed to evaluate submission");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
