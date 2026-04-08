package com.soul.lms.teacher.service;

import org.springframework.http.ResponseEntity;
import java.util.Map;

public interface TeacherServiceInterf {
    ResponseEntity<Map<String, Object>> getDashboardMetrics(Long teacherId);
    ResponseEntity<Map<String, Object>> getDashboardSchedule(Long teacherId);
    ResponseEntity<Map<String, Object>> getStudentPerformance(Long teacherId);
    ResponseEntity<Map<String, Object>> getBatches(Long teacherId);
}
