package com.soul.lms.webinar.service;

import com.soul.lms.model.entity.webinar.SpeakerEntity;
import com.soul.lms.model.entity.webinar.WebinarAttended;
import com.soul.lms.model.entity.webinar.WebinarEntity;
import com.soul.lms.model.entity.webinar.WebinarRegister;
import com.soul.lms.model.entity.webinar.WebinarWatchProgress;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import javax.management.ObjectName;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

public interface WebinarServiceInterf {

    ResponseEntity<Map<String,Object>> addOrEditWebinarDetails(WebinarEntity webinarEntity);

    ResponseEntity<WebinarEntity> fetchWebinarDetailsByDateOrId(LocalDate searchDate, Optional<Long> webinarId);

    ResponseEntity<Map<String,Object>> fetchWebinarDetailsFromToday(String username, int page, int size, Optional<Long> subjectId);

    ResponseEntity<Map<String,Object>> fetchWebinarSchedules(int page, int size, Optional<Long> subjectId);

    ResponseEntity<Map<String ,Object>> registerWebinar(WebinarRegister webinarRegister);

    ResponseEntity<Map<String,Object>> fetchRegisteredWebinars(String username, int page, int size);

    ResponseEntity<Map<String,Object>> fetchStudentsRegisteredForWebinar(Long webinarInfoId);

    ResponseEntity<Map<String,Object>> fetchStudentsAttendanceForWebinar(Long webinarInfoId);

    ResponseEntity<Map<String ,Object>> joinWebinar(WebinarAttended webinarAttended);

    ResponseEntity<Map<String ,Object>> fetchAttendedWebinars(String username, int page, int size);

    ResponseEntity<Map<String, Object>> fetchRecordedWebinars(String username);

    ResponseEntity<Map<String, Object>> fetchRecordedWebinarDetails(Long webinarInfoId, String username);

    ResponseEntity<Map<String, Object>> saveWebinarProgress(WebinarWatchProgress webinarWatchProgress);

    ResponseEntity<Map<String, Object>> toggleWebinarActiveStatus(Long webinarInfoId, Boolean status);

    ArrayList<Map<String,Object>> getWebinarEmailSendResponse(ArrayList<HashMap<String,String>> emailDataList);

    ResponseEntity<Map<String,Object>> fetchAllWebinarsFromToday(int page, int size, Optional<Long> subjectId);
}
