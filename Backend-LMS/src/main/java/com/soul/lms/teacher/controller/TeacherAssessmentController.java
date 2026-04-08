package com.soul.lms.teacher.controller;

import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import com.soul.lms.model.entity.tests.TestDB;
import com.soul.lms.teacher.service.TeacherAssessmentServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/soul/teacher/assessment")
@CrossOrigin(origins = "*")
public class TeacherAssessmentController {

    private final TeacherAssessmentServiceInterf assessmentService;

    public TeacherAssessmentController(TeacherAssessmentServiceInterf assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createAssessment(@RequestBody TestDB testDB, @RequestParam Long teacherId) {
        return assessmentService.createAssessment(testDB, teacherId);
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAssessments(@RequestParam Long teacherId, @RequestParam(required = false) Long batchId) {
        return assessmentService.getAssessments(teacherId, batchId);
    }

    @GetMapping("/submissions")
    public ResponseEntity<Map<String, Object>> getSubmissions(@RequestParam Long testId) {
        return assessmentService.getSubmissions(testId);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateSubmission(@RequestBody SubjectiveTestSubmit evaluation) {
        return assessmentService.evaluateSubmission(evaluation);
    }
}
