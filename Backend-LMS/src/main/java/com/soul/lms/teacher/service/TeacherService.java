package com.soul.lms.teacher.service;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import com.soul.lms.model.entity.liveclass.LiveClassesEntity;
import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherService implements TeacherServiceInterf {

    private final LmsDaoInterf lmsDao;

    public TeacherService(LmsDaoInterf lmsDao) {
        this.lmsDao = lmsDao;
    }

    @Override
    public ResponseEntity<Map<String, Object>> getDashboardMetrics(Long teacherId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. Get Teacher's Batches
            List<BatchTutorEnrollmentDB> enrollments = lmsDao.fetchTutorBatchEnrollments(teacherId).orElse(Collections.emptyList());
            List<Long> batchIds = enrollments.stream()
                    .map(e -> e.getBatchDB().getBatchId())
                    .collect(Collectors.toList());

            // 2. Total Students (Distinct Across Batches)
            long totalStudents = batchIds.stream()
                    .flatMap(bid -> lmsDao.findStudentsEnrolledInABatch(bid).orElse(Collections.emptyList()).stream())
                    .map(BatchStudentEnrollmentsDB::getStudentId)
                    .distinct()
                    .count();

            // 3. Active Classes (Today)
            long activeClasses = 0;
            for (Long bid : batchIds) {
                activeClasses += lmsDao.fetchLiveClassesByBatchIdAndDate(bid, LocalDate.now()).orElse(Collections.emptyList()).size();
            }

            // 4. Pending Assignments (Subjective Submissions not Graded)
            // Note: Simplification here, assuming subjective submissions need grading.
            // In a real scenario, we'd check for a 'grade' or 'remarks' field.
            long pendingAssignments = 0; // Placeholder for exact logic if not immediate

            response.put("status", true);
            response.put("totalStudents", totalStudents);
            response.put("activeClasses", activeClasses);
            response.put("pendingAssignments", pendingAssignments);
            response.put("upcomingClasses", activeClasses); // For now same as active classes today
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getDashboardSchedule(Long teacherId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BatchTutorEnrollmentDB> enrollments = lmsDao.fetchTutorBatchEnrollments(teacherId).orElse(Collections.emptyList());
            List<Map<String, Object>> schedule = new ArrayList<>();
            
            for (BatchTutorEnrollmentDB enrollment : enrollments) {
                Long batchId = enrollment.getBatchDB().getBatchId();
                String batchName = enrollment.getBatchDB().getBatchName();
                
                List<LiveClassesEntity> classes = lmsDao.fetchLiveClassesByBatchIdAndDate(batchId, LocalDate.now()).orElse(Collections.emptyList());
                for (LiveClassesEntity c : classes) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", c.getLiveClassesId());
                    item.put("time", c.getStartClassDateTime());
                    item.put("subject", c.getCourseName());
                    item.put("batch", batchName);
                    item.put("joinUrl", c.getMeetLink());
                    schedule.add(item);
                }
            }
            
            response.put("status", true);
            response.put("schedule", schedule);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getStudentPerformance(Long teacherId) {
        Map<String, Object> response = new HashMap<>();
        // Implementation of performance snapshot (Mocked logic using real entities if possible)
        response.put("status", true);
        response.put("topStudents", new ArrayList<>()); // Placeholder
        response.put("flaggedStudents", new ArrayList<>()); // Placeholder
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<Map<String, Object>> getBatches(Long teacherId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BatchTutorEnrollmentDB> enrollments = lmsDao.fetchTutorBatchEnrollments(teacherId).orElse(Collections.emptyList());
            List<Map<String, Object>> batches = enrollments.stream()
                    .filter(e -> e.getBatchDB() != null)
                    .map(e -> {
                        Map<String, Object> b = new HashMap<>();
                        b.put("id", e.getBatchDB().getBatchId());
                        b.put("name", e.getBatchDB().getBatchName());
                        return b;
                    })
                    .collect(Collectors.toList());

            response.put("status", true);
            response.put("batches", batches);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
