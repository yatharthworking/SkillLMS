package com.soul.lms.teacher.controller;

import com.soul.lms.teacher.service.TeacherServiceInterf;
import com.soul.lms.webinar.service.WebinarServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/teacher")
@CrossOrigin
public class TeacherController {

    private final WebinarServiceInterf webinarServiceInterf;
    private final TeacherServiceInterf teacherServiceInterf;

    @Autowired
    public TeacherController(WebinarServiceInterf webinarServiceInterf, TeacherServiceInterf teacherServiceInterf) {
        super();
        this.webinarServiceInterf = webinarServiceInterf;
        this.teacherServiceInterf = teacherServiceInterf;
    }

    @GetMapping("/dashboard/metrics")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics(@RequestParam Long teacherId) {
        return teacherServiceInterf.getDashboardMetrics(teacherId);
    }

    @GetMapping("/dashboard/schedule")
    public ResponseEntity<Map<String, Object>> getDashboardSchedule(@RequestParam Long teacherId) {
        return teacherServiceInterf.getDashboardSchedule(teacherId);
    }

    @GetMapping("/dashboard/performance")
    public ResponseEntity<Map<String, Object>> getStudentPerformance(@RequestParam Long teacherId) {
        return teacherServiceInterf.getStudentPerformance(teacherId);
    }

    @GetMapping("/dashboard/batches")
    public ResponseEntity<Map<String, Object>> getBatches(@RequestParam Long teacherId) {
        return teacherServiceInterf.getBatches(teacherId);
    }

    //GET API for fetching webinars
    @GetMapping("/fetchWebinarSchedules")
    public ResponseEntity<Map<String,Object>> fetchWebinarSchedules(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam (required = false) Optional<Long> subjectId){

        //Call the service layer method to fetch list of webinars
        return webinarServiceInterf.fetchWebinarSchedules(page,size,subjectId);
    }

    //GET API for fetching students registered for webinar
    @GetMapping("/fetchStudentsRegisteredForWebinar")
    public ResponseEntity<Map<String ,Object>> fetchStudentsRegisteredForWebinar(@RequestParam Long webinarInfoId){

        //call the service layer method to fetch List of students details registered for the webinar
        return webinarServiceInterf.fetchStudentsRegisteredForWebinar(webinarInfoId);

    }

    //GET API for fetching students who attended a webinar
    @GetMapping("/fetchStudentsAttendanceForWebinar")
    public ResponseEntity<Map<String ,Object>> fetchStudentsAttendanceForWebinar(@RequestParam Long webinarInfoId){

        //call the service layer method to fetch List of students details who attended the webinar
        return webinarServiceInterf.fetchStudentsAttendanceForWebinar(webinarInfoId);

    }
}
