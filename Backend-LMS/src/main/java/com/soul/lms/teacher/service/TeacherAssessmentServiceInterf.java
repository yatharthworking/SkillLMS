package com.soul.lms.teacher.service;

import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import com.soul.lms.model.entity.tests.TestDB;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface TeacherAssessmentServiceInterf {
    ResponseEntity<Map<String, Object>> createAssessment(TestDB testDB, Long teacherId);
    ResponseEntity<Map<String, Object>> getAssessments(Long teacherId, Long batchId);
    ResponseEntity<Map<String, Object>> getSubmissions(Long testId);
    ResponseEntity<Map<String, Object>> evaluateSubmission(SubjectiveTestSubmit evaluation);
}
