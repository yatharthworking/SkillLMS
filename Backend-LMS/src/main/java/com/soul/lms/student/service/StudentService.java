package com.soul.lms.student.service;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.feedback.FeedbackEntity;
import com.soul.lms.model.entity.feedback.enumentity.FeedbackType;
import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.batchrelation.BatchTestRelationEntity;
import com.soul.lms.model.entity.certificate.CertificateMasterDB;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.liveclass.LiveClassesEntity;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.tests.CorrectAnswerDB;
import com.soul.lms.model.entity.tests.ObjectiveTestSubmit;
import com.soul.lms.model.entity.tests.TestAnswersDB;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import com.soul.lms.model.entity.modelmasters.masterentitydb.BatchDB;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationMasterDB;
import com.soul.lms.model.entity.tests.TestDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.ImageUploadInput;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.studymaterial.ChaptersDB;
import com.soul.lms.model.entity.studymaterial.EnrolledChaptersDB;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import com.soul.lms.model.entity.studymaterial.MaterialEnrollmentDB;
import com.soul.lms.model.entity.studymaterial.PurchaseMaterialEntity;
import com.soul.lms.model.entity.tests.TestStudentRelation;
import com.soul.lms.model.entity.webinar.WebinarInfo;
import com.soul.lms.model.entity.webinar.WebinarWatchProgress;
import com.soul.lms.model.jparepository.webinarrepository.WebinarInfoRepo;
import com.soul.lms.model.jparepository.webinarrepository.WebinarWatchProgressRepo;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service("studentService")
public class StudentService implements StudentServiceInterf{

    private final LmsDaoInterf lmsDaoInterf;
    private final WebinarInfoRepo webinarInfoRepo;
    private final WebinarWatchProgressRepo webinarWatchProgressRepo;


    @Autowired
    public StudentService(LmsDaoInterf lmsDaoInterf,
                          WebinarInfoRepo webinarInfoRepo,
                          WebinarWatchProgressRepo webinarWatchProgressRepo){
        super();
        this.lmsDaoInterf = lmsDaoInterf;
        this.webinarInfoRepo = webinarInfoRepo;
        this.webinarWatchProgressRepo = webinarWatchProgressRepo;
    }

    //logger
    private final Logger logger = LogManager.getLogger(StudentService.class);


    // service layer to fetch enrolled batches
    @Override
    public ResponseEntity<Map<String, Object>> fetchEnrolledBatches(String userName) {

        // Initialize response map to store the response data
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Fetch user information based on the provided username after trimming any whitespace
            Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(userName.trim());

            // Check if user information is present
            if (userInfoDB.isPresent()) {
                // Fetch batch enrollments for the student based on user details ID
                Optional<List<BatchStudentEnrollmentsDB>> batchStudentEnrollments = lmsDaoInterf.fetchStudentBatchEnrollments(userInfoDB.get().getUserDetailsId());

                // Check if there are any enrollments present
                if (batchStudentEnrollments.isPresent()) {
                    // Iterate through each enrollment to populate transient batch details
                    batchStudentEnrollments.get().forEach(batchStudentEnrollmentsDB -> {

                        // Create a new BatchDB object to store transient batch details
                        BatchDB newBatch = new BatchDB();

                        // Set batch details from the enrollment's batch
                        newBatch.setBatchName(batchStudentEnrollmentsDB.getBatchDB().getBatchName());
                        newBatch.setBatchCapacity(batchStudentEnrollmentsDB.getBatchDB().getBatchCapacity());
                        newBatch.setBatchDescription(batchStudentEnrollmentsDB.getBatchDB().getBatchDescription());
                        newBatch.setBatchId(batchStudentEnrollmentsDB.getBatchDB().getBatchId());
                        newBatch.setBatchStartDateTime(batchStudentEnrollmentsDB.getBatchDB().getBatchStartDateTime());
                        newBatch.setBatchEndDateTime(batchStudentEnrollmentsDB.getBatchDB().getBatchEndDateTime());
                        newBatch.setIsActive(batchStudentEnrollmentsDB.getBatchDB().getIsActive());

                        // Set the transient batch object in the enrollment
                        batchStudentEnrollmentsDB.setBatchDBStudentTransientObj(newBatch);
                    });

                    // Add the enrollments to the response map
                    responseMap.put("enrollments", batchStudentEnrollments.get());
                } else {
                    // If no enrollments are found, return a no content response
                    return ResponseEntity.noContent().build();
                }

                // Return the response map with enrollments
                return ResponseEntity.ok(responseMap);
            } else {
                // If user information is not found, return a bad request response with an error message
                responseMap.put("message", "USER_NOT_EXISTS");
                return ResponseEntity.badRequest().body(responseMap);
            }

        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    //service layer method to fetch certificates of the student
    @Override
    public ResponseEntity<List<CertificateMasterDB>> fetchCertificates(String username) {
       
        return lmsDaoInterf.fetchCertificates(username).map(ResponseEntity :: ok).orElseGet(() -> ResponseEntity.unprocessableEntity().body(Collections.emptyList()));
    }


    //service layer method to fetch live-classes of the student
    @Override
    public ResponseEntity<Map<String, Object>> fetchStudentLiveClasses(String userName, LocalDate date) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Extract studentId from the user information if present
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (studentId != null) {
                // Fetch student batch enrollments
                Optional<List<BatchStudentEnrollmentsDB>> studentEnrollmentsDB = lmsDaoInterf.fetchStudentBatchEnrollments(studentId);

                if (studentEnrollmentsDB.isPresent()) {
                    LinkedList<LiveClassesEntity> liveClassesForDate = new LinkedList<>();

                    // Iterate over each batch enrollment and fetch live classes for each batch
                    studentEnrollmentsDB.get().forEach(enrollment -> {
                        Long batchId = enrollment.getBatchDB().getBatchId();

                        // Fetch live classes for the given batchId and date
                        Optional<List<LiveClassesEntity>> liveClasses = lmsDaoInterf.fetchLiveClassesByBatchIdAndDate(batchId, date);

                        // Add all live classes for the date to the result list
                        liveClasses.ifPresent(liveClassesForDate::addAll);

                    });

                    responseMap.put("data", liveClassesForDate);
                    return ResponseEntity.ok(responseMap);
                } else {
                    responseMap.put("message", "No batch enrollments found for the student");
                    return ResponseEntity.badRequest().body(responseMap);
                }
            } else {
                responseMap.put("message", "User not found for the given username");
                return ResponseEntity.badRequest().body(responseMap);
            }
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> getBatchCourses(Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            List<BatchCourseRelationEntity> batchCourseRelationEntityList = lmsDaoInterf.fetchBatchCourses(batchId).orElse(Collections.emptyList());

            if(!batchCourseRelationEntityList.isEmpty()){

                LinkedList<LibraryMasterDB> coursesList = new LinkedList<>();

                batchCourseRelationEntityList.forEach(batchCourseRelationEntity -> {
                    LibraryMasterDB course = lmsDaoInterf.fetchActiveLibraryMasterById(batchCourseRelationEntity.getCourseId()).orElse(null);
                    if(!Objects.isNull(course)){
                        course.setChaptersDBList(null);
                        course.setMaterialDescDB(null);

                    }
                    coursesList.add(course);
                });

                responseMap.put("status", Boolean.TRUE);
                responseMap.put("courses", coursesList);

                return ResponseEntity.ok(responseMap);
            }else {
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.badRequest().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchUpcomingStudentTests(Long batchId, String userName, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Extract studentId from the user information if present
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (batchId != null && studentId != null) {

                Optional<List<BatchTestRelationEntity>> batchTestRelationEntityList = Optional.empty();

                if(Objects.equals("LIVE_TEST", testTypeString)) {
                    batchTestRelationEntityList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                } else if (Objects.equals("MOCK_TEST", testTypeString)) {
                    batchTestRelationEntityList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                }



                if (batchTestRelationEntityList.isPresent()) {

                    LinkedList<TestDB> testList = new LinkedList<>();

                    batchTestRelationEntityList.get().forEach(batchTestRelationEntity -> {

                        Optional<TestDB> test = lmsDaoInterf.findUpcomingTestsById(batchTestRelationEntity.getTestId());

                        if(test.isPresent()) {
                            Optional<TestStudentRelation> unAttemptedTest = lmsDaoInterf.fetchTestUnAttempt(test.get().getTestId(), studentId);

                            if (unAttemptedTest.isPresent()) {

                                Optional<BatchCourseRelationEntity> batchCourseRelationEntity = lmsDaoInterf.findByBatchIdAndCourseId(batchId, test.get().getLibraryMasterDB().getMaterialId());

                                UserInfoDB assignedTutorName = new UserInfoDB();

                                if(batchCourseRelationEntity.isPresent()) {
                                    assignedTutorName = lmsDaoInterf.getUserInfoById(batchCourseRelationEntity.get().getTutorId()).orElse(null);
                                }

                                test.get().setBatchId(batchId);
                                if(!Objects.isNull(assignedTutorName)) {
                                    test.get().setTutorName(assignedTutorName.getFullName());
                                }
                                test.get().setMaterialName(test.get().getLibraryMasterDB().getMaterialName());
                                test.get().setMaterialId(test.get().getLibraryMasterDB().getMaterialId());
                                test.get().setSubject(test.get().getLibraryMasterDB().getMaterialName());

                                test.get().setTestQuestionsDB(null);
                                testList.add(test.get());
                            }
                        }
                    });

                    if(!testList.isEmpty()) {

                        LinkedList<TestDB> newList = testList.stream().sorted(Comparator.comparing(TestDB :: getTestStartDate)).collect(Collectors.toCollection(LinkedList :: new));

                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("tests", newList);

                        return ResponseEntity.ok(responseMap);
                    }

                    responseMap.put("tests", Collections.emptyList());
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "No tests found");

                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Batch and course relation not found");
                return ResponseEntity.badRequest().body(responseMap);

            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "batchId and userName is mandatory");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchAttemptedStudentTests(Long batchId, String userName, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Extract studentId from the user information if present
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (batchId != null && studentId != null) {

                Optional<List<BatchTestRelationEntity>> batchTestRelationEntityList = Optional.empty();

                if(Objects.equals("LIVE_TEST", testTypeString)) {
                    batchTestRelationEntityList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                } else if (Objects.equals("MOCK_TEST", testTypeString)) {
                    batchTestRelationEntityList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                }


                if (batchTestRelationEntityList.isPresent()) {

                    LinkedList<TestDB> attemptedTestList = new LinkedList<>();

                    batchTestRelationEntityList.get().forEach(batchTestRelationEntity -> {

                        Optional<TestDB> test = lmsDaoInterf.findActiveAndPublishedTestById(batchTestRelationEntity.getTestId());

                        if(test.isPresent()) {
                            Optional<TestStudentRelation> attemptedTest = lmsDaoInterf.fetchTestAttempt(test.get().getTestId(), studentId);

                            if (attemptedTest.isPresent()) {

                                Optional<BatchCourseRelationEntity> batchCourseRelationEntity = lmsDaoInterf.findByBatchIdAndCourseId(batchId, test.get().getLibraryMasterDB().getMaterialId());

                                UserInfoDB assignedTutorName = new UserInfoDB();

                                if(batchCourseRelationEntity.isPresent()) {
                                    assignedTutorName = lmsDaoInterf.getUserInfoById(batchCourseRelationEntity.get().getTutorId()).orElse(null);
                                }

                                test.get().setBatchId(batchId);
                                if(!Objects.isNull(assignedTutorName)) {
                                    test.get().setTutorName(assignedTutorName.getFullName());
                                }
                                test.get().setMaterialName(test.get().getLibraryMasterDB().getMaterialName());
                                test.get().setMaterialId(test.get().getLibraryMasterDB().getMaterialId());
                                test.get().setSubject(test.get().getLibraryMasterDB().getMaterialName());

                                test.get().setTestQuestionsDB(null);
                                attemptedTestList.add(test.get());
                            }
                        }
                    });

                    if(!attemptedTestList.isEmpty()) {

                        LinkedList<TestDB> newAttemptedList = attemptedTestList.stream().sorted(Comparator.comparing(TestDB :: getTestStartDate)).collect(Collectors.toCollection(LinkedList :: new));

                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("attemptedTests", newAttemptedList);

                        return ResponseEntity.ok(responseMap);
                    }

                    responseMap.put("tests", Collections.emptyList());
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "No tests found");

                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Batch and course relation not found");
                return ResponseEntity.badRequest().body(responseMap);

            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "batchId and userName is mandatory");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchUnAttemptedStudentTests(Long batchId, String userName, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Extract studentId from the user information if present
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (batchId != null && studentId != null) {

                Optional<List<BatchTestRelationEntity>> batchTestRelationEntityList = Optional.empty();

                if(Objects.equals("LIVE_TEST", testTypeString)) {
                    batchTestRelationEntityList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                } else if (Objects.equals("MOCK_TEST", testTypeString)) {
                    batchTestRelationEntityList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                }


                if (batchTestRelationEntityList.isPresent()) {

                    LinkedList<TestDB> unAttemptedTestList = new LinkedList<>();

                    batchTestRelationEntityList.get().forEach(batchTestRelationEntity -> {

                        Optional<TestDB> test = lmsDaoInterf.findActiveAndPublishedTestById(batchTestRelationEntity.getTestId());

                        if(test.isPresent()) {

                            Optional<TestStudentRelation> unAttemptedTest = lmsDaoInterf.fetchTestUnAttempt(test.get().getTestId(), studentId);

                            if (unAttemptedTest.isPresent()) {

                                Optional<BatchCourseRelationEntity> batchCourseRelationEntity = lmsDaoInterf.findByBatchIdAndCourseId(batchId, test.get().getLibraryMasterDB().getMaterialId());

                                UserInfoDB assignedTutorName = new UserInfoDB();

                                if(batchCourseRelationEntity.isPresent()) {
                                    assignedTutorName = lmsDaoInterf.getUserInfoById(batchCourseRelationEntity.get().getTutorId()).orElse(null);
                                }

                                test.get().setBatchId(batchId);
                                if(!Objects.isNull(assignedTutorName)) {
                                    test.get().setTutorName(assignedTutorName.getFullName());
                                }
                                test.get().setMaterialName(test.get().getLibraryMasterDB().getMaterialName());
                                test.get().setMaterialId(test.get().getLibraryMasterDB().getMaterialId());
                                test.get().setSubject(test.get().getLibraryMasterDB().getMaterialName());

                                test.get().setTestQuestionsDB(null);
                                unAttemptedTestList.add(test.get());
                            }
                        }
                    });

                    if(!unAttemptedTestList.isEmpty()) {

                        LinkedList<TestDB> newUnAttemptedList = unAttemptedTestList.stream().sorted(Comparator.comparing(TestDB :: getTestStartDate)).collect(Collectors.toCollection(LinkedList :: new));

                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("unAttemptedTest", newUnAttemptedList);

                        return ResponseEntity.ok(responseMap);
                    }

                    responseMap.put("tests", Collections.emptyList());
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "No tests found");

                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Batch and course relation not found");
                return ResponseEntity.badRequest().body(responseMap);

            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "batchId and userName is mandatory");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> getBatchInfo(Long studentId, Long organizationId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            List<BatchDB> batchDBList = lmsDaoInterf.findAllBatches().orElse(Collections.emptyList());

            Optional<OrganizationMasterDB> organizationsDB = lmsDaoInterf.findOrganizationMasterById(organizationId);

            if(organizationsDB.isPresent()){
                List<BatchDB> enrolledBatches = batchDBList.stream()
                        .filter(batch -> batch.getBatchStudentEnrollmentsDB().stream()
                                .anyMatch(enrollment -> enrollment.getStudentId().equals(studentId) && enrollment.getIsActive()))
                        .toList();

                if(!enrolledBatches.isEmpty()){
                    enrolledBatches.getFirst().setBatchStudentEnrollmentsDB(null);
                    enrolledBatches.getFirst().setBatchTutorEnrollmentsDB(null);
                    enrolledBatches.getFirst().setAnnouncementEntityDB(null);
                    enrolledBatches.getFirst().setOrganizationMasterName(organizationsDB.get().getOrganizationName());
                    responseMap.put("batchDetails", enrolledBatches.getFirst());
                }else{
                    responseMap.put("batchDetails", new HashMap<>());
                    responseMap.put("message","user doesn't exist/is inactive");
                }
            }else{
                responseMap.put("batchDetails", new HashMap<>());
                responseMap.put("message","organization with the given ID doesn't exists");
                return ResponseEntity.badRequest().body(responseMap);
            }

            return ResponseEntity.ok(responseMap);

        }catch (Exception e) {

            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    public ResponseEntity<Map<String, Object>> fetchAllSchedules(String userName, LocalDate date, Long batchId) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Validate studentId and date
            if (userInfo.isPresent() && !Objects.isNull(date)) {
                LinkedList<Map<String, Object>> scheduleList = new LinkedList<>();

                // Fetch holidays and add to the schedule list
                List<HolidayMaster> holidayMasterList = lmsDaoInterf.fetchHolidaysDateWise(userInfo.get().getOrganizationsDB().getOrgId(), date);
                if (!Objects.isNull(holidayMasterList) && !holidayMasterList.isEmpty()) {
                    holidayMasterList.forEach(holiday -> scheduleList.add(convertHolidayToMap(holiday)));
                }

                // Fetch registered webinars and add to the schedule list
                List<Long> webinarRegisterIdList = lmsDaoInterf.fetchRegisteredWebinarInfoByStudent(userName).orElse(Collections.emptyList());
                if (!webinarRegisterIdList.isEmpty()) {
                    webinarRegisterIdList.forEach(webinarInfoId -> {
                        Optional<WebinarInfo> webinarInfo = lmsDaoInterf.findWebinarDateWise(webinarInfoId, date);
                        webinarInfo.ifPresent(info -> scheduleList.add(convertWebinarToMap(info)));
                    });
                }


                // Fetch batch tests and add to the schedule list
                List<BatchTestRelationEntity> batchTestsList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST).orElse(Collections.emptyList());
                if (!batchTestsList.isEmpty()) {
                    batchTestsList.forEach(batchTests -> {
                        TestDB liveTest = lmsDaoInterf.findTestsDateWise(batchTests.getTestId(), date);
                        if (!Objects.isNull(liveTest)) {
                            liveTest.setTestQuestionsDB(null);
                            scheduleList.add(convertTestToMap(liveTest));
                        }
                    });
                }

                // Check if schedule list is empty
                if (scheduleList.isEmpty()) {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("schedules", Collections.emptyList());
                    responseMap.put("message", "No schedules found for the given date");
                } else {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("schedules", scheduleList);
                }

                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Invalid username or date");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Internal server error");
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    public ResponseEntity<Map<String, Object>> fetchMonthlySchedules(String userName, Integer year, Integer month, Long batchId) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Validate studentId
            if (userInfo.isPresent() && year != null && month != null) {
                Map<String, List<Map<String, Object>>> schedulesByDate = new HashMap<>();

                // Helper to add schedule
                java.util.function.BiConsumer<LocalDate, Map<String, Object>> addSchedule = (date, map) -> {
                    if (date.getYear() == year && date.getMonthValue() == month) {
                        String dateStr = date.toString(); // YYYY-MM-DD
                        schedulesByDate.computeIfAbsent(dateStr, k -> new LinkedList<>()).add(map);
                    }
                };

                // Fetch holidays and add to the schedule list
                List<HolidayMaster> holidayMasterList = lmsDaoInterf.fetchAllHolidays(userInfo.get().getOrganizationsDB().getOrgId());
                if (!Objects.isNull(holidayMasterList) && !holidayMasterList.isEmpty()) {
                    holidayMasterList.forEach(holiday -> {
                        // For multiday holidays, add to each day in the month
                        LocalDate currentDate = holiday.getHolidayFromDate();
                        LocalDate endDate = holiday.getHolidayToDate();
                        while (!currentDate.isAfter(endDate)) {
                            addSchedule.accept(currentDate, convertHolidayToMap(holiday));
                            currentDate = currentDate.plusDays(1);
                        }
                    });
                }

                // Fetch registered webinars and add to the schedule list
                List<Long> webinarRegisterIdList = lmsDaoInterf.fetchRegisteredWebinarInfoByStudent(userName).orElse(Collections.emptyList());
                if (!webinarRegisterIdList.isEmpty()) {
                    webinarRegisterIdList.forEach(webinarInfoId -> {
                        Optional<WebinarInfo> webinarInfo = lmsDaoInterf.fetchAllWebinarInfoById(webinarInfoId);
                        if (webinarInfo.isPresent()) {
                            LocalDate date = webinarInfo.get().getWebinarStartTime().toLocalDate();
                            addSchedule.accept(date, convertWebinarToMap(webinarInfo.get()));
                        }
                    });
                }

                // Fetch batch tests and add to the schedule list
                if (batchId != null) {
                    List<BatchTestRelationEntity> batchTestsList = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST).orElse(Collections.emptyList());
                    if (!batchTestsList.isEmpty()) {
                        batchTestsList.forEach(batchTests -> {
                            Optional<TestDB> liveTest = lmsDaoInterf.findTestById(batchTests.getTestId());
                            if (liveTest.isPresent() && !Objects.isNull(liveTest.get().getTestStartDate())) {
                                TestDB testDb = liveTest.get();
                                testDb.setTestQuestionsDB(null);
                                addSchedule.accept(testDb.getTestStartDate().toLocalDate(), convertTestToMap(testDb));
                            }
                        });
                    }
                }

                responseMap.put("status", Boolean.TRUE);
                responseMap.put("schedules", schedulesByDate);
                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Invalid username or date");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Internal server error");
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    private Map<String, Object> convertHolidayToMap(HolidayMaster holiday) {
        HashMap<String, Object> holidayMap = new HashMap<>();
        holidayMap.put("holidayId", holiday.getHolidayId());
        holidayMap.put("holidayName", holiday.getHolidayName());
        holidayMap.put("holidayFromDate", holiday.getHolidayFromDate());
        holidayMap.put("holidayToDate", holiday.getHolidayToDate());
        holidayMap.put("holidayType", holiday.getHolidayType());
        holidayMap.put("scheduleType", "HOLIDAY");
        return holidayMap;
    }

    private Map<String, Object> convertTestToMap(TestDB test) {
        HashMap<String, Object> testMap = new HashMap<>();
        testMap.put("testId", test.getTestId());
        testMap.put("testName", test.getTestName());
        testMap.put("testStartDate", test.getTestStartDate());
        testMap.put("testEndDate", test.getTestEndDate());
        testMap.put("tutorName", test.getLibraryMasterDB().getUserInfoDB().getFullName());
        testMap.put("scheduleType", "LIVE TEST");
        return testMap;
    }


    private Map<String, Object> convertWebinarToMap(WebinarInfo webinar) {
        HashMap<String, Object> webinarMap = new HashMap<>();
        webinarMap.put("webinarInfoId", webinar.getWebinarInfoId());
        webinarMap.put("webinarName", webinar.getWebinarName());
        webinarMap.put(
                "webinarSubject",
                webinar.getSubjectMasterDB() != null
                        ? webinar.getSubjectMasterDB().getSubjectName()
                        : webinar.getSubjectName()
        );
        String name = "";
        StringJoiner stringJoiner = new StringJoiner(",");
        webinar.getSpeakerEntityList().forEach(speakerEntity -> {
            stringJoiner.add(speakerEntity.getName());
        });
        webinarMap.put("webinarSpeaker", stringJoiner.toString());
        webinarMap.put("webinarStartDate", webinar.getWebinarStartTime());
        webinarMap.put("webinarEndDate", webinar.getWebinarEndTime());
        webinarMap.put("scheduleType", "WEBINAR");
        return webinarMap;
    }





    @Override
    public ResponseEntity<Map<String,Object>> saveFeedback(FeedbackEntity feedbackEntity)
    {

        HashMap<String, Object> responseMap = new HashMap<>();
        try
        {

            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(feedbackEntity.getUserName());

            // Extract studentId from the user information if present
            Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if(!Objects.isNull(userId)) {
                feedbackEntity.setFeedbackByUser(userId);
                feedbackEntity.setCreatedBy(userId);
            } else {

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found for username");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }


            if(Objects.equals(feedbackEntity.getFeedbackType(), FeedbackType.COURSE_FEEDBACK)){
                feedbackEntity.setFeedbackType(FeedbackType.COURSE_FEEDBACK);
            } else if(Objects.equals(feedbackEntity.getFeedbackType(), FeedbackType.LIVE_TEST_FEEDBACK)) {
                feedbackEntity.setFeedbackType(FeedbackType.LIVE_TEST_FEEDBACK);
            } else {

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Provide correct feedback type");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Boolean isSaved = lmsDaoInterf.saveFeedback(feedbackEntity);


            if(isSaved){

                responseMap.put("status", Boolean.TRUE);
                responseMap.put("message", "Feedback saved");
                return ResponseEntity.ok(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Feedback not saved");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        }
        catch (Exception e)
        {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Internal server error");
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchStudentTestsQuestions(Long testId){

        HashMap<String, Object> responseMap = new HashMap<>();

        try{
            // fetch questionsDB
            Optional<List<TestQuestionsDB>> presentQuestions = lmsDaoInterf.findQuestionsFromTestId(testId);

            // check if List is present
            if(presentQuestions.isEmpty()){
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.internalServerError().body(responseMap);
            } else {

                presentQuestions.get().forEach(questions -> questions.setCorrectAnswerDB(null));

                responseMap.put("data", presentQuestions.get());
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            }
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("exception", e.getMessage());
            responseMap.put("status", Boolean.FALSE);

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchExamTests(Long batchId, String userName, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "batchId and userName are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            TestType testType = resolveTestType(testTypeString);
            List<BatchTestRelationEntity> batchTests = lmsDaoInterf.fetchBatchTests(batchId, testType).orElse(Collections.emptyList());

            List<Map<String, Object>> tests = batchTests.stream()
                    .map(BatchTestRelationEntity::getTestId)
                    .map(lmsDaoInterf::findTestById)
                    .flatMap(Optional::stream)
                    .map(test -> mapExamCard(test, batchId, studentId))
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(card -> (LocalDateTime) card.get("testStartDate"), Comparator.nullsLast(LocalDateTime::compareTo)))
                    .toList();

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("tests", tests);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchExamTestDetails(Long testId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<TestDB> optionalTest = lmsDaoInterf.findTestById(testId);

            if (optionalTest.isEmpty()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Test not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            TestDB test = optionalTest.get();
            Optional<List<TestQuestionsDB>> questionList = lmsDaoInterf.findQuestionsFromTestId(testId);
            List<Map<String, Object>> questions = questionList.orElse(Collections.emptyList()).stream()
                    .map(this::mapQuestionForExam)
                    .toList();

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("test", mapExamDetails(test, questions));
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchExamResult(Long testId, String userName, String testPattern) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<TestDB> optionalTest = lmsDaoInterf.findTestById(testId);
            if (optionalTest.isEmpty()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Test not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<TestStudentRelation> attemptedTest = lmsDaoInterf.fetchTestAttempt(testId, studentId);
            if (attemptedTest.isEmpty()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Result not available");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            TestDB test = optionalTest.get();
            List<TestQuestionsDB> questions = lmsDaoInterf.findQuestionsFromTestId(testId).orElse(Collections.emptyList());
            List<Map<String, Object>> questionResults = new ArrayList<>();
            int totalMarks = 0;
            int score = 0;
            int correctCount = 0;
            int incorrectCount = 0;
            int answeredCount = 0;

            for (TestQuestionsDB question : questions) {
                List<TestAnswersDB> answers = lmsDaoInterf.findByTestQuestionsDB(question);
                CorrectAnswerDB correctAnswer = lmsDaoInterf.findByCorrectTestQuestionsDB(question);
                List<ObjectiveTestSubmit> submissions = lmsDaoInterf
                        .findObjectviteTestByTestIdAndStudentIdAndQuestionId(testId, studentId, question.getQuestionId());

                Long selectedAnswerId = submissions.stream()
                        .map(ObjectiveTestSubmit::getSubmittedAnswerId)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse(null);

                Long correctAnswerId = Optional.ofNullable(correctAnswer)
                        .map(CorrectAnswerDB::getTestAnswersDB)
                        .map(TestAnswersDB::getAnswerId)
                        .orElse(null);

                boolean answered = selectedAnswerId != null;
                boolean isCorrect = answered && Objects.equals(selectedAnswerId, correctAnswerId);
                int questionMark = Optional.ofNullable(question.getQuestionMark()).orElse(1);

                totalMarks += questionMark;
                if (answered) {
                    answeredCount++;
                }
                if (isCorrect) {
                    correctCount++;
                    score += questionMark;
                } else if (answered) {
                    incorrectCount++;
                }

                Map<String, Object> questionResult = new LinkedHashMap<>();
                questionResult.put("questionId", question.getQuestionId());
                questionResult.put("questionNumber", questionResults.size() + 1);
                questionResult.put("question", question.getQuestion());
                questionResult.put("questionMark", questionMark);
                questionResult.put("selectedAnswerId", selectedAnswerId);
                questionResult.put("correctAnswerId", correctAnswerId);
                questionResult.put("isCorrect", isCorrect);
                questionResult.put("isAnswered", answered);
                questionResult.put("options", answers.stream().map(answer -> {
                    Map<String, Object> option = new LinkedHashMap<>();
                    option.put("answerId", answer.getAnswerId());
                    option.put("answer", answer.getAnswer());
                    option.put("isCorrect", Objects.equals(answer.getAnswerId(), correctAnswerId));
                    option.put("isSelected", Objects.equals(answer.getAnswerId(), selectedAnswerId));
                    return option;
                }).toList());
                questionResults.add(questionResult);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("testId", test.getTestId());
            result.put("testName", test.getTestName());
            result.put("subject", resolveSubject(test));
            result.put("testPattern", testPattern);
            result.put("score", score);
            result.put("totalMarks", totalMarks);
            result.put("correctAnswers", correctCount);
            result.put("incorrectAnswers", incorrectCount);
            result.put("answeredQuestions", answeredCount);
            result.put("totalQuestions", questions.size());
            result.put("percentage", totalMarks == 0 ? 0.0 : (score * 100.0) / totalMarks);
            result.put("passingMarks", Optional.ofNullable(test.getPassingMarks()).orElse(0));
            result.put("questions", questionResults);

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("result", result);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchResultsHistory(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "batchId and userName are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentId, resolveTestType(testTypeString));
            responseMap.put("status", Boolean.TRUE);
            responseMap.put("results", resultRows);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchPerformanceOverview(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "batchId and userName are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentId, resolveTestType(testTypeString));

            double averagePercentage = resultRows.stream()
                    .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                    .average()
                    .orElse(0.0);

            Map<String, Object> highestScore = resultRows.stream()
                    .max(Comparator.comparingDouble((Map<String, Object> row) -> ((Number) row.get("percentage")).doubleValue()))
                    .orElse(new LinkedHashMap<>());

            String weakestSubject = resultRows.stream()
                    .collect(Collectors.groupingBy(
                            row -> String.valueOf(row.get("subject")),
                            LinkedHashMap::new,
                            Collectors.averagingDouble(row -> ((Number) row.get("percentage")).doubleValue())
                    ))
                    .entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("N/A");

            List<Map<String, Object>> trendData = resultRows.stream()
                    .sorted(Comparator.comparing((Map<String, Object> row) -> (LocalDateTime) row.get("dateAttempted"), Comparator.nullsLast(LocalDateTime::compareTo)))
                    .map(row -> {
                        Map<String, Object> point = new LinkedHashMap<>();
                        point.put("label", row.get("dateLabel"));
                        point.put("percentage", row.get("percentage"));
                        point.put("testName", row.get("testName"));
                        return point;
                    })
                    .toList();

            List<Map<String, Object>> insights = buildPerformanceInsights(resultRows);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("totalTestsAttempted", resultRows.size());
            summary.put("averageScore", roundToOneDecimal(averagePercentage));
            summary.put("highestScore", highestScore.isEmpty() ? null : highestScore.get("scoreDisplay"));
            summary.put("highestPercentage", highestScore.isEmpty() ? 0.0 : highestScore.get("percentage"));
            summary.put("weakestSubject", weakestSubject);

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("summary", summary);
            responseMap.put("scoreTrend", trendData);
            responseMap.put("insights", insights);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchSubjectPerformance(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "batchId and userName are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentId, resolveTestType(testTypeString));

            List<Map<String, Object>> subjects = resultRows.stream()
                    .collect(Collectors.groupingBy(row -> String.valueOf(row.get("subject")), LinkedHashMap::new, Collectors.toList()))
                    .entrySet().stream()
                    .map(entry -> {
                        double average = entry.getValue().stream()
                                .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                                .average()
                                .orElse(0.0);

                        Map<String, Object> subject = new LinkedHashMap<>();
                        subject.put("subject", entry.getKey());
                        subject.put("averageScore", roundToOneDecimal(average));
                        subject.put("totalTestsAttempted", entry.getValue().size());
                        subject.put("strength", resolveStrengthIndicator(average));
                        subject.put("progressValue", Math.min(100.0, roundToOneDecimal(average)));
                        return subject;
                    })
                    .sorted(Comparator.comparingDouble((Map<String, Object> subject) -> -((Number) subject.get("averageScore")).doubleValue()))
                    .toList();

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("subjects", subjects);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchAiRecommendations(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "batchId and userName are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentId, resolveTestType(testTypeString));
            List<Map<String, Object>> weakTopics = buildWeakTopicRows(batchId, userName, testTypeString);
            List<Map<String, Object>> courseSignals = buildCourseProgressSignals(batchId, userName);
            List<Map<String, Object>> recommendations = new ArrayList<>();

            courseSignals.stream()
                    .filter(course -> ((Number) course.get("progressPercentage")).intValue() > 0 && ((Number) course.get("progressPercentage")).intValue() < 100)
                    .findFirst()
                    .ifPresent(course -> recommendations.add(buildRecommendation(
                            "resume-course",
                            "Continue incomplete courses",
                            "Pick up " + course.get("materialName") + " from " + course.get("progressPercentage") + "% and continue with " + course.get("nextChapterName") + ".",
                            "Start Learning",
                            "myCourses",
                            "high"
                    )));

            weakTopics.stream().findFirst().ifPresent(topic -> recommendations.add(buildRecommendation(
                    "revise-weak-topic",
                    "Revise weak topics",
                    "Your current weak area is " + topic.get("topicName") + ". Review it before your next assessment.",
                    "Revise Topic",
                    "adaptiveLearning",
                    "high"
            )));

            if (!resultRows.isEmpty()) {
                recommendations.add(buildRecommendation(
                        "practice-quiz",
                        "Attempt practice quizzes",
                        "Reinforce recent learning by taking another timed quiz and checking if your score improves.",
                        "Practice Now",
                        "examsTests",
                        "medium"
                ));
            }

            weakTopics.stream()
                    .filter(topic -> "Weak".equals(topic.get("confidenceLevel")))
                    .findFirst()
                    .ifPresent(topic -> recommendations.add(buildRecommendation(
                            "frequent-mistakes",
                            "Focus on frequently incorrect topics",
                            topic.get("subject") + " needs extra attention. Spend more time on " + topic.get("topicName") + " this week.",
                            "View Weak Areas",
                            "adaptiveLearning",
                            "medium"
                    )));

            if (recommendations.isEmpty()) {
                recommendations.add(buildRecommendation(
                        "stay-consistent",
                        "Keep momentum going",
                        "You are on a steady path. Continue learning and take a fresh practice test to sharpen retention.",
                        "Continue Learning",
                        "myCourses",
                        "medium"
                ));
            }

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("recommendations", recommendations.stream().limit(4).toList());
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchWeakTopics(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            responseMap.put("status", Boolean.TRUE);
            responseMap.put("weakTopics", buildWeakTopicRows(batchId, userName, testTypeString));
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchLearningPath(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            List<Map<String, Object>> weakTopics = buildWeakTopicRows(batchId, userName, testTypeString);
            List<Map<String, Object>> courseSignals = buildCourseProgressSignals(batchId, userName);
            Map<String, Object> focusTopic = weakTopics.isEmpty() ? new LinkedHashMap<>() : weakTopics.getFirst();
            Map<String, Object> resumeCourse = courseSignals.stream()
                    .filter(course -> ((Number) course.get("progressPercentage")).intValue() < 100)
                    .findFirst()
                    .orElse(new LinkedHashMap<>());

            String topicName = focusTopic.isEmpty() ? "your priority topic" : String.valueOf(focusTopic.get("topicName"));
            String subjectName = focusTopic.isEmpty() ? "your weakest subject" : String.valueOf(focusTopic.get("subject"));

            List<Map<String, Object>> steps = List.of(
                    buildLearningStep(1, "Revise topic", "Review " + topicName + " in " + subjectName + " and refresh key concepts.", "myCourses"),
                    buildLearningStep(2, "Practice quiz", "Attempt a focused quiz after revision to test retention and speed.", "examsTests"),
                    buildLearningStep(3, "Re-test", "Take the next test and compare the result with your recent average.", "resultsPerformance")
            );

            Map<String, Object> nextBestAction = new LinkedHashMap<>();
            nextBestAction.put("title", resumeCourse.isEmpty() ? "Revise your weakest topic" : "Continue " + resumeCourse.get("materialName"));
            nextBestAction.put("description", resumeCourse.isEmpty()
                    ? "Your next strongest move is to revisit " + topicName + " and then practice it."
                    : "Resume from " + resumeCourse.get("nextChapterName") + " and complete the next learning segment.");
            nextBestAction.put("actionLabel", resumeCourse.isEmpty() ? "Open Courses" : "Resume Course");
            nextBestAction.put("actionTarget", "myCourses");

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("steps", steps);
            responseMap.put("nextBestAction", nextBestAction);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchCompetitiveModules(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "batchId and userName are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            TestType testType = resolveTestType(testTypeString);
            List<TestDB> batchTests = fetchBatchTestsForType(batchId, testType);
            List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentId, testType);
            List<Map<String, Object>> subjectRows = fetchSubjectPerformance(batchId, userName, testTypeString).getBody() != null
                    ? (List<Map<String, Object>>) fetchSubjectPerformance(batchId, userName, testTypeString).getBody().get("subjects")
                    : Collections.emptyList();
            List<Map<String, Object>> courseSignals = buildCourseProgressSignals(batchId, userName);

            List<Map<String, Object>> modules = new ArrayList<>();
            modules.add(buildCompetitiveModule(
                    "full-length-tests",
                    "Full-Length Tests",
                    "Simulate complete exam conditions with longer timed assessments.",
                    deriveDifficultyFromTests(batchTests),
                    batchTests.size(),
                    "Attempt Test",
                    "examsTests",
                    "featured"
            ));
            modules.add(buildCompetitiveModule(
                    "topic-wise-practice",
                    "Topic-wise Practice",
                    "Strengthen individual subjects and focus areas with targeted practice.",
                    "Intermediate",
                    subjectRows.size(),
                    "Start Practice",
                    "adaptiveLearning",
                    "normal"
            ));
            modules.add(buildCompetitiveModule(
                    "previous-year",
                    "Previous Year Questions",
                    "Review exam-style patterns and recurring question areas from past practice sets.",
                    "Advanced",
                    Math.max(1, batchTests.size()),
                    "Solve Questions",
                    "resultsPerformance",
                    "normal"
            ));
            modules.add(buildCompetitiveModule(
                    "mock-tests",
                    "Mock Tests",
                    "Train under time pressure and compare performance with the leaderboard.",
                    deriveDifficultyFromTests(batchTests),
                    Math.max(1, resultRows.size()),
                    "Start Practice",
                    "examsTests",
                    "normal"
            ));

            List<Map<String, Object>> challenges = List.of(
                    buildChallengeCard("quick-challenge", "15 Min Quick Test", "Fast accuracy round with short questions and a strict timer.", "Trending", "Start Challenge", "examsTests"),
                    buildChallengeCard("daily-challenge", "Daily Challenge Mode", "A fresh challenge to maintain consistency and improve rank every day.", "Active", "Play Today", "competitiveLearning"),
                    buildChallengeCard("weekly-test", "Weekly Competitive Test", "Longer challenge focused on rank improvement for the week.", "Leaderboard", "Attempt Test", "examsTests")
            );

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("testsAttempted", resultRows.size());
            stats.put("accuracy", roundToOneDecimal(resultRows.stream()
                    .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                    .average()
                    .orElse(0.0)));
            stats.put("rankImprovement", Math.max(0, 5 - resultRows.size()) + resultRows.size());
            stats.put("topPercent", resultRows.isEmpty() ? 100 : Math.max(10, 100 - (resultRows.size() * 8)));

            List<Map<String, Object>> insights = buildCompetitiveInsights(resultRows, stats);
            List<Map<String, Object>> skillContent = buildSkillDevelopmentContent(subjectRows, courseSignals);
            Map<String, Object> skillSummary = buildSkillSummary(skillContent);

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("modules", modules);
            responseMap.put("challenges", challenges);
            responseMap.put("stats", stats);
            responseMap.put("insights", insights);
            responseMap.put("skillContent", skillContent);
            responseMap.put("skillSummary", skillSummary);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchCompetitiveLeaderboard(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            responseMap.put("status", Boolean.TRUE);
            responseMap.put("leaderboard", buildLeaderboardRows(batchId, userName, resolveTestType(testTypeString)));
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchCompetitiveUserRank(Long batchId, String userName, String testTypeString) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            List<Map<String, Object>> leaderboard = buildLeaderboardRows(batchId, userName, resolveTestType(testTypeString));
            Map<String, Object> userRank = leaderboard.stream()
                    .filter(entry -> Objects.equals(entry.get("userName"), userName))
                    .findFirst()
                    .orElseGet(() -> {
                        Map<String, Object> empty = new LinkedHashMap<>();
                        empty.put("userName", userName);
                        empty.put("rank", leaderboard.size() + 1);
                        empty.put("averageScore", 0.0);
                        empty.put("testsAttempted", 0);
                        empty.put("scoreDisplay", "0%");
                        return empty;
                    });

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("userRank", userRank);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    private TestType resolveTestType(String testTypeString) {
        if (Objects.equals("MOCK_TEST", testTypeString)) {
            return TestType.MOCK_TEST;
        }
        return TestType.LIVE_TEST;
    }

    private List<Map<String, Object>> buildCourseProgressSignals(Long batchId, String userName) {
        List<EnrolledChaptersDB> completedChapters = lmsDaoInterf.fetchCompletedChapters(userName).orElse(Collections.emptyList());
        Set<Long> completedChapterIds = completedChapters.stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                .map(EnrolledChaptersDB::getChapterId)
                .collect(Collectors.toSet());

        Map<Long, Map<String, Object>> courseSignalMap = new LinkedHashMap<>();

        List<MaterialEnrollmentDB> enrolledMaterials = lmsDaoInterf.fetchEnrolledMaterials(userName, Optional.of(Boolean.FALSE)).orElse(Collections.emptyList());
        enrolledMaterials.forEach(enrollment -> {
            LibraryMasterDB course = enrollment.getLibraryMasterDB();
            if (course != null) {
                courseSignalMap.put(course.getMaterialId(), buildCourseSignal(course, completedChapterIds));
            }
        });

        List<BatchCourseRelationEntity> batchCourses = lmsDaoInterf.fetchBatchCourses(batchId).orElse(Collections.emptyList());
        batchCourses.forEach(batchCourse -> lmsDaoInterf.fetchActiveLibraryMasterById(batchCourse.getCourseId())
                .ifPresent(course -> courseSignalMap.putIfAbsent(course.getMaterialId(), buildCourseSignal(course, completedChapterIds))));

        return courseSignalMap.values().stream()
                .sorted(Comparator.comparingInt((Map<String, Object> course) -> ((Number) course.get("progressPercentage")).intValue()).reversed())
                .toList();
    }

    private List<TestDB> fetchBatchTestsForType(Long batchId, TestType testType) {
        List<TestDB> tests = lmsDaoInterf.fetchBatchTests(batchId, testType).orElse(Collections.emptyList()).stream()
                .map(BatchTestRelationEntity::getTestId)
                .map(lmsDaoInterf::findTestById)
                .flatMap(Optional::stream)
                .toList();

        if (!tests.isEmpty()) {
            return tests;
        }

        if (!Objects.equals(testType, TestType.LIVE_TEST)) {
            return lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST).orElse(Collections.emptyList()).stream()
                    .map(BatchTestRelationEntity::getTestId)
                    .map(lmsDaoInterf::findTestById)
                    .flatMap(Optional::stream)
                    .toList();
        }

        return tests;
    }

    private Map<String, Object> buildCourseSignal(LibraryMasterDB course, Set<Long> completedChapterIds) {
        List<ChaptersDB> chapters = Optional.ofNullable(course.getChaptersDBList()).orElse(Collections.emptyList()).stream()
                .filter(chapter -> !Boolean.FALSE.equals(chapter.getIsActive()))
                .toList();
        int totalChapters = chapters.size();
        int completedCount = (int) chapters.stream()
                .map(ChaptersDB::getChapterId)
                .filter(completedChapterIds::contains)
                .count();
        int progress = totalChapters == 0 ? 0 : (int) Math.round((completedCount * 100.0) / totalChapters);
        String nextChapterName = chapters.stream()
                .filter(chapter -> !completedChapterIds.contains(chapter.getChapterId()))
                .map(ChaptersDB::getChapterName)
                .findFirst()
                .orElse("the next module");

        Map<String, Object> signal = new LinkedHashMap<>();
        signal.put("materialId", course.getMaterialId());
        signal.put("materialName", course.getMaterialName());
        signal.put("subject", resolveSubject(course));
        signal.put("progressPercentage", progress);
        signal.put("completedChapters", completedCount);
        signal.put("totalChapters", totalChapters);
        signal.put("nextChapterName", nextChapterName);
        return signal;
    }

    private List<Map<String, Object>> buildWeakTopicRows(Long batchId, String userName, String testTypeString) {
        Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
        Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

        if (Objects.isNull(batchId) || Objects.isNull(studentId)) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentId, resolveTestType(testTypeString));
        List<Map<String, Object>> courseSignals = buildCourseProgressSignals(batchId, userName);

        Map<String, List<Map<String, Object>>> resultsBySubject = resultRows.stream()
                .collect(Collectors.groupingBy(row -> String.valueOf(row.get("subject")), LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> weakTopics = new ArrayList<>();

        resultsBySubject.forEach((subject, subjectResults) -> {
            double average = subjectResults.stream()
                    .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                    .average()
                    .orElse(0.0);
            long lowScores = subjectResults.stream()
                    .filter(row -> ((Number) row.get("percentage")).doubleValue() < 50.0)
                    .count();
            Map<String, Object> linkedCourse = courseSignals.stream()
                    .filter(course -> Objects.equals(course.get("subject"), subject))
                    .findFirst()
                    .orElse(new LinkedHashMap<>());

            String topicName = linkedCourse.isEmpty()
                    ? subject + " fundamentals"
                    : String.valueOf(linkedCourse.get("nextChapterName"));

            Map<String, Object> weakTopic = new LinkedHashMap<>();
            weakTopic.put("subject", subject);
            weakTopic.put("topicName", topicName);
            weakTopic.put("averageScore", roundToOneDecimal(average));
            weakTopic.put("confidenceLevel", resolveStrengthIndicator(average));
            weakTopic.put("progressValue", Math.max(10.0, Math.min(100.0, roundToOneDecimal(average))));
            weakTopic.put("mistakeCount", lowScores);
            weakTopic.put("highlight", average < 50 ? "Weak" : (average < 75 ? "Average" : "Strong"));
            weakTopic.put("reason", average < 50
                    ? "Scores below 50% triggered a weak-topic alert."
                    : (lowScores > 0 ? "Recent mistakes suggest more focused practice is needed." : "Current performance is stable."));
            weakTopics.add(weakTopic);
        });

        if (weakTopics.isEmpty()) {
            courseSignals.stream().limit(3).forEach(course -> {
                Map<String, Object> weakTopic = new LinkedHashMap<>();
                weakTopic.put("subject", course.get("subject"));
                weakTopic.put("topicName", course.get("nextChapterName"));
                weakTopic.put("averageScore", course.get("progressPercentage"));
                weakTopic.put("confidenceLevel", resolveStrengthIndicator(((Number) course.get("progressPercentage")).doubleValue()));
                weakTopic.put("progressValue", course.get("progressPercentage"));
                weakTopic.put("mistakeCount", 0);
                weakTopic.put("highlight", "Average");
                weakTopic.put("reason", "Resume this topic to strengthen overall course progress.");
                weakTopics.add(weakTopic);
            });
        }

        return weakTopics.stream()
                .sorted(Comparator.comparingDouble((Map<String, Object> topic) -> ((Number) topic.get("averageScore")).doubleValue()))
                .limit(5)
                .toList();
    }

    private Map<String, Object> buildRecommendation(String id, String title, String description, String actionLabel, String actionTarget, String priority) {
        Map<String, Object> recommendation = new LinkedHashMap<>();
        recommendation.put("id", id);
        recommendation.put("tag", "AI Recommended");
        recommendation.put("title", title);
        recommendation.put("description", description);
        recommendation.put("actionLabel", actionLabel);
        recommendation.put("actionTarget", actionTarget);
        recommendation.put("priority", priority);
        return recommendation;
    }

    private Map<String, Object> buildLearningStep(int stepNumber, String title, String description, String actionTarget) {
        Map<String, Object> step = new LinkedHashMap<>();
        step.put("stepNumber", stepNumber);
        step.put("title", title);
        step.put("description", description);
        step.put("actionTarget", actionTarget);
        return step;
    }

    private Map<String, Object> buildCompetitiveModule(String id, String title, String description, String difficulty, int totalCount, String actionLabel, String actionTarget, String emphasis) {
        Map<String, Object> module = new LinkedHashMap<>();
        module.put("id", id);
        module.put("title", title);
        module.put("description", description);
        module.put("difficulty", difficulty);
        module.put("totalCount", totalCount);
        module.put("actionLabel", actionLabel);
        module.put("actionTarget", actionTarget);
        module.put("emphasis", emphasis);
        return module;
    }

    private Map<String, Object> buildChallengeCard(String id, String title, String description, String badge, String actionLabel, String actionTarget) {
        Map<String, Object> challenge = new LinkedHashMap<>();
        challenge.put("id", id);
        challenge.put("title", title);
        challenge.put("description", description);
        challenge.put("badge", badge);
        challenge.put("actionLabel", actionLabel);
        challenge.put("actionTarget", actionTarget);
        return challenge;
    }

    private List<Map<String, Object>> buildSkillDevelopmentContent(List<Map<String, Object>> subjectRows, List<Map<String, Object>> courseSignals) {
        List<Map<String, Object>> skillCards = new ArrayList<>();

        String weakestSubject = subjectRows.stream()
                .min(Comparator.comparingDouble(subject -> ((Number) subject.get("averageScore")).doubleValue()))
                .map(subject -> String.valueOf(subject.get("subject")))
                .orElse("Core Aptitude");

        String strongestSubject = subjectRows.stream()
                .max(Comparator.comparingDouble(subject -> ((Number) subject.get("averageScore")).doubleValue()))
                .map(subject -> String.valueOf(subject.get("subject")))
                .orElse("Problem Solving");

        Map<String, Object> resumeCourse = courseSignals.stream()
                .filter(signal -> ((Number) signal.get("progressPercentage")).doubleValue() < 100.0)
                .min(Comparator.comparingDouble(signal -> ((Number) signal.get("progressPercentage")).doubleValue()))
                .orElseGet(() -> {
                    Map<String, Object> fallback = new LinkedHashMap<>();
                    fallback.put("materialName", "Skill Builder Track");
                    fallback.put("progressPercentage", 0.0);
                    return fallback;
                });

        skillCards.add(buildSkillContentCard(
                "aptitude-drills",
                "Aptitude Skill Builder",
                "Sharpen speed, accuracy, and reasoning for competitive problem solving.",
                weakestSubject,
                roundToOneDecimal(100.0 - ((Number) resumeCourse.get("progressPercentage")).doubleValue()),
                "Priority",
                "15 mins/day",
                "Practice set + timer",
                "Start Skill Practice",
                "assignmentsPractice"
        ));
        skillCards.add(buildSkillContentCard(
                "communication-readiness",
                "Communication & Interview Readiness",
                "Strengthen comprehension, expression, and confidence for assessment and placement rounds.",
                strongestSubject,
                subjectRows.isEmpty() ? 52.0 : roundToOneDecimal(subjectRows.stream()
                        .mapToDouble(subject -> ((Number) subject.get("averageScore")).doubleValue())
                        .average()
                        .orElse(52.0)),
                "In Progress",
                "20 mins/day",
                "Revision + reflection",
                "Continue Learning",
                "myCourses"
        ));
        skillCards.add(buildSkillContentCard(
                "revision-lab",
                "Skill Development Revision Lab",
                "Blend revision content with topic practice to convert weak areas into exam-ready strengths.",
                weakestSubject,
                subjectRows.stream()
                        .filter(subject -> Objects.equals(subject.get("subject"), weakestSubject))
                        .map(subject -> roundToOneDecimal(((Number) subject.get("progressValue")).doubleValue()))
                        .findFirst()
                        .orElse(48.0),
                "Recommended",
                "30 mins/session",
                "Revise + re-test",
                "Review Performance",
                "resultsPerformance"
        ));

        return skillCards;
    }

    private Map<String, Object> buildSkillSummary(List<Map<String, Object>> skillContent) {
        Map<String, Object> summary = new LinkedHashMap<>();

        double readinessScore = skillContent.stream()
                .mapToDouble(card -> ((Number) card.get("progressValue")).doubleValue())
                .average()
                .orElse(0.0);

        long activeTracks = skillContent.stream()
                .filter(card -> !Objects.equals(card.get("status"), "Completed"))
                .count();

        String focusSkill = skillContent.stream()
                .min(Comparator.comparingDouble(card -> ((Number) card.get("progressValue")).doubleValue()))
                .map(card -> String.valueOf(card.get("title")))
                .orElse("Skill Development");

        summary.put("readinessScore", roundToOneDecimal(readinessScore));
        summary.put("activeTracks", activeTracks);
        summary.put("focusSkill", focusSkill);
        return summary;
    }

    private Map<String, Object> buildSkillContentCard(String id, String title, String description, String focusArea, double progressValue, String status, String estimatedTime, String deliverable, String actionLabel, String actionTarget) {
        Map<String, Object> skillCard = new LinkedHashMap<>();
        skillCard.put("id", id);
        skillCard.put("title", title);
        skillCard.put("description", description);
        skillCard.put("focusArea", focusArea);
        skillCard.put("progressValue", Math.max(0.0, Math.min(progressValue, 100.0)));
        skillCard.put("status", status);
        skillCard.put("estimatedTime", estimatedTime);
        skillCard.put("deliverable", deliverable);
        skillCard.put("actionLabel", actionLabel);
        skillCard.put("actionTarget", actionTarget);
        return skillCard;
    }

    private String deriveDifficultyFromTests(List<TestDB> tests) {
        int averageMarks = (int) Math.round(tests.stream()
                .map(TestDB::getTotalMarks)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(40.0));

        if (averageMarks >= 80) {
            return "Advanced";
        }
        if (averageMarks >= 40) {
            return "Intermediate";
        }
        return "Beginner";
    }

    private List<Map<String, Object>> buildLeaderboardRows(Long batchId, String currentUserName, TestType testType) {
        List<BatchStudentEnrollmentsDB> students = lmsDaoInterf.findStudentsEnrolledInABatch(batchId).orElse(Collections.emptyList());
        List<Map<String, Object>> leaderboard = new ArrayList<>();

        for (BatchStudentEnrollmentsDB studentEnrollment : students) {
            Optional<UserInfoDB> studentInfo = lmsDaoInterf.getUserInfoById(studentEnrollment.getStudentId());
            if (studentInfo.isEmpty()) {
                continue;
            }

            String userName = studentInfo.get().getEmail();
            if (userName == null || userName.isBlank()) {
                userName = studentInfo.get().getFullName();
            }

            List<Map<String, Object>> resultRows = buildAttemptedResultRows(batchId, studentEnrollment.getStudentId(), testType);
            double averageScore = resultRows.stream()
                    .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                    .average()
                    .orElse(0.0);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userName", userName);
            row.put("fullName", studentInfo.get().getFullName());
            row.put("averageScore", roundToOneDecimal(averageScore));
            row.put("testsAttempted", resultRows.size());
            row.put("scoreDisplay", roundToOneDecimal(averageScore) + "%");
            leaderboard.add(row);
        }

        List<Map<String, Object>> sorted = leaderboard.stream()
                .sorted(Comparator
                        .comparingDouble((Map<String, Object> row) -> ((Number) row.get("averageScore")).doubleValue())
                        .reversed()
                        .thenComparingInt(row -> -((Number) row.get("testsAttempted")).intValue()))
                .toList();

        List<Map<String, Object>> ranked = new ArrayList<>();
        for (int index = 0; index < sorted.size(); index++) {
            Map<String, Object> rankedRow = new LinkedHashMap<>(sorted.get(index));
            rankedRow.put("rank", index + 1);
            rankedRow.put("isCurrentUser", Objects.equals(rankedRow.get("userName"), currentUserName));
            ranked.add(rankedRow);
        }

        return ranked.stream().limit(10).toList();
    }

    private List<Map<String, Object>> buildCompetitiveInsights(List<Map<String, Object>> resultRows, Map<String, Object> stats) {
        List<Map<String, Object>> insights = new ArrayList<>();

        if (resultRows.size() >= 2) {
            double latest = ((Number) resultRows.getFirst().get("percentage")).doubleValue();
            double previous = ((Number) resultRows.get(1).get("percentage")).doubleValue();
            if (latest > previous) {
                insights.add(buildInsight("Rank Momentum", "You improved your recent score trend by " + roundToOneDecimal(latest - previous) + " points.", "trend-up"));
            }
        }

        int topPercent = ((Number) stats.get("topPercent")).intValue();
        insights.add(buildInsight("Competitive Standing", "You are currently in the top " + topPercent + "% of active competitors.", "gain"));

        if (((Number) stats.get("testsAttempted")).intValue() < 3) {
            insights.add(buildInsight("Attempt More", "Attempt more mock tests to strengthen your leaderboard rank and accuracy.", "focus"));
        } else {
            insights.add(buildInsight("Consistency", "Keep taking timed challenges to maintain rank and improve exam temperament.", "steady"));
        }

        return insights.stream().limit(3).toList();
    }

    private List<Map<String, Object>> buildAttemptedResultRows(Long batchId, Long studentId, TestType testType) {
        List<BatchTestRelationEntity> batchTests = lmsDaoInterf.fetchBatchTests(batchId, testType).orElse(Collections.emptyList());

        return batchTests.stream()
                .map(BatchTestRelationEntity::getTestId)
                .map(lmsDaoInterf::findTestById)
                .flatMap(Optional::stream)
                .filter(test -> lmsDaoInterf.fetchTestAttempt(test.getTestId(), studentId).isPresent())
                .map(test -> buildResultRow(test, studentId))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing((Map<String, Object> row) -> (LocalDateTime) row.get("dateAttempted"), Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .toList();
    }

    private Map<String, Object> buildResultRow(TestDB test, Long studentId) {
        List<TestQuestionsDB> questions = lmsDaoInterf.findQuestionsFromTestId(test.getTestId()).orElse(Collections.emptyList());
        int totalMarks = 0;
        int score = 0;
        int correctAnswers = 0;
        int answeredQuestions = 0;
        LocalDateTime dateAttempted = null;

        for (TestQuestionsDB question : questions) {
            List<ObjectiveTestSubmit> submissions = lmsDaoInterf
                    .findObjectviteTestByTestIdAndStudentIdAndQuestionId(test.getTestId(), studentId, question.getQuestionId());

            if (!submissions.isEmpty()) {
                LocalDateTime questionAttemptTime = submissions.stream()
                        .map(ObjectiveTestSubmit::getCreationTimeStamp)
                        .filter(Objects::nonNull)
                        .min(LocalDateTime::compareTo)
                        .orElse(null);

                if (dateAttempted == null || (questionAttemptTime != null && questionAttemptTime.isBefore(dateAttempted))) {
                    dateAttempted = questionAttemptTime;
                }
            }

            Long selectedAnswerId = submissions.stream()
                    .map(ObjectiveTestSubmit::getSubmittedAnswerId)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);

            int questionMark = Optional.ofNullable(question.getQuestionMark()).orElse(1);
            totalMarks += questionMark;

            if (selectedAnswerId != null) {
                answeredQuestions++;
                CorrectAnswerDB correctAnswer = lmsDaoInterf.findByCorrectTestQuestionsDB(question);
                Long correctAnswerId = Optional.ofNullable(correctAnswer)
                        .map(CorrectAnswerDB::getTestAnswersDB)
                        .map(TestAnswersDB::getAnswerId)
                        .orElse(null);

                if (Objects.equals(selectedAnswerId, correctAnswerId)) {
                    score += questionMark;
                    correctAnswers++;
                }
            }
        }

        double percentage = totalMarks == 0 ? 0.0 : (score * 100.0) / totalMarks;

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("testId", test.getTestId());
        row.put("testName", test.getTestName());
        row.put("materialId", test.getLibraryMasterDB() != null ? test.getLibraryMasterDB().getMaterialId() : null);
        row.put("subject", resolveSubject(test));
        row.put("dateAttempted", dateAttempted != null ? dateAttempted : test.getTestEndDate());
        row.put("dateLabel", formatDateLabel(dateAttempted != null ? dateAttempted : test.getTestEndDate()));
        row.put("score", score);
        row.put("totalMarks", totalMarks);
        row.put("scoreDisplay", score + "/" + totalMarks);
        row.put("percentage", roundToOneDecimal(percentage));
        row.put("status", score >= Optional.ofNullable(test.getPassingMarks()).orElse(0) ? "PASS" : "FAIL");
        row.put("answeredQuestions", answeredQuestions);
        row.put("correctAnswers", correctAnswers);
        row.put("passingMarks", Optional.ofNullable(test.getPassingMarks()).orElse(0));
        return row;
    }

    private List<Map<String, Object>> buildPerformanceInsights(List<Map<String, Object>> resultRows) {
        List<Map<String, Object>> insights = new ArrayList<>();
        List<Map<String, Object>> chronologicalResults = resultRows.stream()
                .sorted(Comparator.comparing((Map<String, Object> row) -> (LocalDateTime) row.get("dateAttempted"), Comparator.nullsLast(LocalDateTime::compareTo)))
                .toList();

        if (chronologicalResults.isEmpty()) {
            return insights;
        }

        Map<String, List<Map<String, Object>>> subjectGroups = chronologicalResults.stream()
                .collect(Collectors.groupingBy(
                        row -> String.valueOf(row.get("subject")),
                        LinkedHashMap::new,
                        Collectors.mapping(row -> row, Collectors.toList())
                ));

        subjectGroups.forEach((subject, entries) -> {
            if (entries.size() >= 2) {
                double first = ((Number) entries.getFirst().get("percentage")).doubleValue();
                double last = ((Number) entries.getLast().get("percentage")).doubleValue();
                if (last - first >= 5) {
                    insights.add(buildInsight("Improving", "You are improving in " + subject, "trend-up"));
                }
            }
        });

        subjectGroups.entrySet().stream()
                .min(Comparator.comparingDouble(entry -> entry.getValue().stream()
                        .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                        .average()
                        .orElse(0.0)))
                .ifPresent(entry -> insights.add(buildInsight("Focus Area", "Focus more on " + entry.getKey(), "focus")));

        if (chronologicalResults.size() >= 3) {
            List<Map<String, Object>> recent = chronologicalResults.stream().skip(Math.max(0, chronologicalResults.size() - 5L)).toList();
            List<Map<String, Object>> previous = chronologicalResults.stream()
                    .limit(Math.max(0, chronologicalResults.size() - recent.size()))
                    .toList();

            if (!previous.isEmpty()) {
                double recentAverage = recent.stream().mapToDouble(row -> ((Number) row.get("percentage")).doubleValue()).average().orElse(0.0);
                double previousAverage = previous.stream().mapToDouble(row -> ((Number) row.get("percentage")).doubleValue()).average().orElse(0.0);
                double delta = recentAverage - previousAverage;

                if (delta >= 3) {
                    insights.add(buildInsight("Weekly Gain", "Your average score increased by " + roundToOneDecimal(delta) + "% recently", "gain"));
                } else if (delta <= -3) {
                    insights.add(buildInsight("Watch Trend", "Your recent average dipped by " + roundToOneDecimal(Math.abs(delta)) + "%. Review weaker topics.", "alert"));
                }
            }
        }

        if (insights.isEmpty()) {
            insights.add(buildInsight("Steady", "Your performance is steady. Keep practicing to raise your average further.", "steady"));
        }

        return insights.stream().limit(3).toList();
    }

    private Map<String, Object> buildInsight(String title, String message, String type) {
        Map<String, Object> insight = new LinkedHashMap<>();
        insight.put("title", title);
        insight.put("message", message);
        insight.put("type", type);
        return insight;
    }

    private String resolveStrengthIndicator(double average) {
        if (average >= 75) {
            return "Strong";
        }
        if (average >= 50) {
            return "Average";
        }
        return "Weak";
    }

    private String formatDateLabel(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Pending";
        }
        return dateTime.toLocalDate().toString();
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private Map<String, Object> mapExamCard(TestDB test, Long batchId, Long studentId) {
        Optional<BatchCourseRelationEntity> batchCourseRelationEntity = Optional.empty();
        if (test.getLibraryMasterDB() != null && test.getLibraryMasterDB().getMaterialId() != null) {
            batchCourseRelationEntity = lmsDaoInterf.findByBatchIdAndCourseId(batchId, test.getLibraryMasterDB().getMaterialId());
        }

        UserInfoDB assignedTutor = batchCourseRelationEntity
                .flatMap(relation -> lmsDaoInterf.getUserInfoById(relation.getTutorId()))
                .orElse(null);

        boolean isAttempted = lmsDaoInterf.fetchTestAttempt(test.getTestId(), studentId).isPresent();
        boolean isUpcoming = test.getTestStartDate() != null && test.getTestStartDate().isAfter(LocalDateTime.now());

        Map<String, Object> testCard = new LinkedHashMap<>();
        testCard.put("testId", test.getTestId());
        testCard.put("title", test.getTestName());
        testCard.put("testName", test.getTestName());
        testCard.put("subject", resolveSubject(test));
        testCard.put("teacherName", assignedTutor != null ? assignedTutor.getFullName() : null);
        testCard.put("description", test.getDescription());
        testCard.put("difficulty", deriveDifficulty(test));
        testCard.put("status", isAttempted ? "COMPLETED" : (isUpcoming ? "NOT_STARTED" : "AVAILABLE"));
        testCard.put("totalQuestions", Optional.ofNullable(test.getTotalQuestions()).orElse(0));
        testCard.put("totalMarks", Optional.ofNullable(test.getTotalMarks()).orElse(0));
        testCard.put("timeLimit", Optional.ofNullable(test.getTimeLimit()).orElse(0));
        testCard.put("durationLabel", formatDuration(test));
        testCard.put("testStartDate", test.getTestStartDate());
        testCard.put("testEndDate", test.getTestEndDate());
        testCard.put("materialId", test.getLibraryMasterDB() != null ? test.getLibraryMasterDB().getMaterialId() : null);
        testCard.put("testType", test.getTestType());
        testCard.put("testPattern", test.getTestPattern());
        testCard.put("passingMarks", test.getPassingMarks());
        return testCard;
    }

    private Map<String, Object> mapExamDetails(TestDB test, List<Map<String, Object>> questions) {
        Map<String, Object> testDetails = new LinkedHashMap<>();
        testDetails.put("testId", test.getTestId());
        testDetails.put("testName", test.getTestName());
        testDetails.put("title", test.getTestName());
        testDetails.put("description", test.getDescription());
        testDetails.put("subject", resolveSubject(test));
        testDetails.put("totalQuestions", Optional.ofNullable(test.getTotalQuestions()).orElse(questions.size()));
        testDetails.put("totalMarks", Optional.ofNullable(test.getTotalMarks()).orElse(0));
        testDetails.put("timeLimit", Optional.ofNullable(test.getTimeLimit()).orElse(0));
        testDetails.put("durationLabel", formatDuration(test));
        testDetails.put("difficulty", deriveDifficulty(test));
        testDetails.put("testStartDate", test.getTestStartDate());
        testDetails.put("testEndDate", test.getTestEndDate());
        testDetails.put("materialId", test.getLibraryMasterDB() != null ? test.getLibraryMasterDB().getMaterialId() : null);
        testDetails.put("testPattern", test.getTestPattern());
        testDetails.put("questions", questions);
        return testDetails;
    }

    private Map<String, Object> mapQuestionForExam(TestQuestionsDB question) {
        Map<String, Object> questionMap = new LinkedHashMap<>();
        questionMap.put("questionId", question.getQuestionId());
        questionMap.put("question", question.getQuestion());
        questionMap.put("questionType", question.getQuestionType());
        questionMap.put("questionMark", Optional.ofNullable(question.getQuestionMark()).orElse(1));
        questionMap.put("options", question.getTestAnswersDB().stream().map(answer -> {
            Map<String, Object> option = new LinkedHashMap<>();
            option.put("answerId", answer.getAnswerId());
            option.put("answer", answer.getAnswer());
            return option;
        }).toList());
        return questionMap;
    }

    private String resolveSubject(TestDB test) {
        if (test.getSubject() != null) {
            return test.getSubject();
        }
        if (test.getLibraryMasterDB() != null && test.getLibraryMasterDB().getMaterialName() != null) {
            return test.getLibraryMasterDB().getMaterialName();
        }
        return "General";
    }

    private String resolveSubject(LibraryMasterDB course) {
        if (course.getSubjectName() != null) {
            return course.getSubjectName();
        }
        if (course.getSubjectMasterDB() != null && course.getSubjectMasterDB().getSubjectName() != null) {
            return course.getSubjectMasterDB().getSubjectName();
        }
        return course.getMaterialName() != null ? course.getMaterialName() : "General";
    }

    private String deriveDifficulty(TestDB test) {
        int marks = Optional.ofNullable(test.getTotalMarks()).orElse(0);
        if (marks >= 80) {
            return "Advanced";
        }
        if (marks >= 40) {
            return "Intermediate";
        }
        return "Beginner";
    }

    private String formatDuration(TestDB test) {
        Integer timeLimit = test.getTimeLimit();
        if (timeLimit != null && timeLimit > 0) {
            return timeLimit + " mins";
        }
        if (test.getTestStartDate() != null && test.getTestEndDate() != null) {
            long minutes = java.time.Duration.between(test.getTestStartDate(), test.getTestEndDate()).toMinutes();
            if (minutes > 0) {
                return minutes + " mins";
            }
        }
        return "Self paced";
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchDashboardSummary(String userName, Long batchId, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            if (userName == null || userName.isBlank()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "userName is required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (studentId == null) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Long resolvedBatchId = resolveAuthorizedBatchId(studentId, batchId);
            List<MaterialEnrollmentDB> enrolledMaterials = lmsDaoInterf.fetchEnrolledMaterials(userName, Optional.of(Boolean.FALSE)).orElse(Collections.emptyList());
            List<EnrolledChaptersDB> completedChapters = lmsDaoInterf.fetchCompletedChapters(userName).orElse(Collections.emptyList())
                    .stream()
                    .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                    .toList();
            List<Map<String, Object>> resultRows = resolvedBatchId != null
                    ? buildAttemptedResultRows(resolvedBatchId, studentId, resolveTestType(testTypeString))
                    : Collections.emptyList();
            List<WebinarWatchProgress> webinarProgressList = webinarWatchProgressRepo.findByUsername(userName);

            LocalDate today = LocalDate.now();
            long studyTimeTodayMinutes = calculateStudyTimeTodayMinutes(completedChapters, resultRows, webinarProgressList, today);
            int coursesAccessedToday = countCoursesAccessedToday(enrolledMaterials, completedChapters, resultRows, today);
            int completionRate = calculateCompletionRate(enrolledMaterials);
            int learningStreak = calculateLearningStreak(completedChapters, resultRows, webinarProgressList);
            List<Map<String, Object>> weeklyProgress = buildWeeklyProgress(completedChapters, resultRows, webinarProgressList, completionRate, today);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("studyTime", formatMinutesAsStudyTime(studyTimeTodayMinutes));
            summary.put("studyTimeMinutes", studyTimeTodayMinutes);
            summary.put("coursesAccessed", coursesAccessedToday);
            summary.put("completionRate", completionRate);
            summary.put("streak", learningStreak);
            summary.put("streakLabel", learningStreak + (learningStreak == 1 ? " day" : " days"));
            summary.put("weeklyProgress", weeklyProgress);

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("summary", summary);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchMyCoursesOverview(String userName, Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            if (userName == null || userName.isBlank()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "userName is required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName.trim());
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (studentId == null) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Long resolvedBatchId = resolveAuthorizedBatchId(studentId, batchId);
            List<MaterialEnrollmentDB> allInProgressCourses = prepareEnrollmentCourses(
                    lmsDaoInterf.fetchEnrolledMaterials(userName.trim(), Optional.of(Boolean.FALSE)).orElse(Collections.emptyList()),
                    false
            );
            List<MaterialEnrollmentDB> allCompletedCourses = prepareEnrollmentCourses(
                    lmsDaoInterf.fetchEnrolledMaterials(userName.trim(), Optional.of(Boolean.TRUE)).orElse(Collections.emptyList()),
                    true
            );
            List<MaterialEnrollmentDB> inProgressCourses = filterClassroomEnrollments(allInProgressCourses);
            List<MaterialEnrollmentDB> completedCourses = filterClassroomEnrollments(allCompletedCourses);
            List<LibraryMasterDB> libraryCourses = prepareAvailableLibraryCourses(userName.trim(), resolvedBatchId);

            List<Map<String, Object>> subjectRows = buildMyCourseSubjects(inProgressCourses, completedCourses);
            Map<String, Object> summaryPayload = buildDashboardSummaryPayload(userName.trim(), resolvedBatchId, studentId, "LIVE_TEST");
            summaryPayload.put("completionRate", calculateCompletionRate(Stream.concat(inProgressCourses.stream(), completedCourses.stream()).toList()));
            summaryPayload.put("enrolledSubjectsCount", subjectRows.size());

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("batchId", resolvedBatchId);
            responseMap.put("summary", summaryPayload);
            responseMap.put("subjects", subjectRows);
            responseMap.put("courses", buildStudentCourseCards(inProgressCourses, completedCourses));
            responseMap.put("libraryCourses", libraryCourses);
            responseMap.put("inProgressCourses", inProgressCourses);
            responseMap.put("completedCourses", completedCourses);
            responseMap.put("skillPrograms", buildSkillProgramsPayload(
                    resolvedBatchId,
                    prepareAvailableSkillPrograms(userName.trim(), resolvedBatchId),
                    allInProgressCourses,
                    allCompletedCourses
            ));
            responseMap.put("lastSyncedAt", LocalDateTime.now());
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchStudentSkillPrograms(String userName, Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            if (userName == null || userName.isBlank()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "userName is required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName.trim());
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (studentId == null) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Long resolvedBatchId = resolveAuthorizedBatchId(studentId, batchId);
            List<MaterialEnrollmentDB> inProgressCourses = prepareEnrollmentCourses(
                    lmsDaoInterf.fetchEnrolledMaterials(userName.trim(), Optional.of(Boolean.FALSE)).orElse(Collections.emptyList()),
                    false
            );
            List<MaterialEnrollmentDB> completedCourses = prepareEnrollmentCourses(
                    lmsDaoInterf.fetchEnrolledMaterials(userName.trim(), Optional.of(Boolean.TRUE)).orElse(Collections.emptyList()),
                    true
            );
            List<LibraryMasterDB> libraryCourses = prepareAvailableSkillPrograms(userName.trim(), resolvedBatchId);
            Map<String, Object> skillProgramsPayload = buildSkillProgramsPayload(resolvedBatchId, libraryCourses, inProgressCourses, completedCourses);

            responseMap.putAll(skillProgramsPayload);
            responseMap.put("status", Boolean.TRUE);
            responseMap.put("lastSyncedAt", LocalDateTime.now());
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> enrollInCourse(String userName, Long batchId, PurchaseMaterialEntity purchaseMaterialEntity) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            if (userName == null || userName.isBlank()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "userName is required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            if (purchaseMaterialEntity == null || purchaseMaterialEntity.getMaterialId() == null) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "materialId is required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName.trim());
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);
            if (studentId == null) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Long resolvedBatchId = resolveAuthorizedBatchId(studentId, batchId);
            Long materialId = purchaseMaterialEntity.getMaterialId();

            if (lmsDaoInterf.fetchEnrollmentStatus(materialId, userName.trim()).isPresent()) {
                responseMap.put("status", Boolean.TRUE);
                responseMap.put("message", "ALREADY_ENROLLED");
                return ResponseEntity.ok(responseMap);
            }

            LibraryMasterDB course = lmsDaoInterf.fetchActiveLibraryMasterById(materialId).orElse(null);
            if (course == null || !Boolean.TRUE.equals(course.getIsActive())) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Course not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            boolean assignedToBatch = resolvedBatchId != null && lmsDaoInterf.fetchBatchCourses(resolvedBatchId)
                    .orElse(Collections.emptyList())
                    .stream()
                    .filter(batchCourse -> Boolean.TRUE.equals(batchCourse.getIsActive()))
                    .anyMatch(batchCourse -> Objects.equals(batchCourse.getCourseId(), materialId));

            if (!assignedToBatch && !Boolean.TRUE.equals(course.getIsPublished())) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Course is not available for this student");
                return ResponseEntity.status(403).body(responseMap);
            }

            MaterialEnrollmentDB enrollmentDB = buildCourseEnrollment(
                    userName.trim(),
                    course,
                    resolveTutorNameForCourse(course, resolvedBatchId)
            );

            if (!Boolean.TRUE.equals(lmsDaoInterf.saveMaterialEnrollment(enrollmentDB))) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Failed to enroll in course");
                return ResponseEntity.internalServerError().body(responseMap);
            }

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("message", "Course enrolled successfully");
            responseMap.put("materialId", materialId);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchLearningHistory(String userName, Long batchId, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            if (studentId == null) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Long resolvedBatchId = batchId;
            if (resolvedBatchId == null) {
                resolvedBatchId = lmsDaoInterf.fetchStudentBatchEnrollments(studentId)
                        .orElse(Collections.emptyList())
                        .stream()
                        .map(BatchStudentEnrollmentsDB::getBatchDB)
                        .filter(Objects::nonNull)
                        .map(BatchDB::getBatchId)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse(null);
            }

            List<MaterialEnrollmentDB> enrolledMaterials = lmsDaoInterf.fetchEnrolledMaterials(userName, Optional.of(Boolean.FALSE)).orElse(Collections.emptyList());
            List<EnrolledChaptersDB> completedChapters = lmsDaoInterf.fetchCompletedChapters(userName).orElse(Collections.emptyList())
                    .stream()
                    .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                    .toList();

            List<Map<String, Object>> resultRows = resolvedBatchId != null
                    ? buildAttemptedResultRows(resolvedBatchId, studentId, resolveTestType(testTypeString))
                    : Collections.emptyList();

            List<WebinarWatchProgress> webinarProgressList = webinarWatchProgressRepo.findByUsername(userName);
            Map<Long, WebinarInfo> webinarInfoMap = webinarInfoRepo.findByIsActiveTrueOrderByCreationTimeStampDesc(Pageable.unpaged()).getContent()
                    .stream()
                    .collect(Collectors.toMap(WebinarInfo::getWebinarInfoId, webinar -> webinar, (first, second) -> first, LinkedHashMap::new));

            List<Map<String, Object>> courseHistory = enrolledMaterials.stream()
                    .map(this::buildCourseHistoryCard)
                    .filter(Objects::nonNull)
                    .toList();

            int lessonsCompleted = completedChapters.size();
            int testsAttempted = resultRows.size();
            long watchedMinutes = Math.round(webinarProgressList.stream()
                    .map(WebinarWatchProgress::getWatchedSeconds)
                    .filter(Objects::nonNull)
                    .mapToDouble(Double::doubleValue)
                    .sum() / 60.0);
            long estimatedLessonMinutes = lessonsCompleted * 25L;
            long estimatedTestMinutes = resultRows.stream()
                    .mapToLong(row -> Math.max(15L, Math.round(((Number) row.getOrDefault("answeredQuestions", 0)).doubleValue() * 2.5)))
                    .sum();
            long totalLearningMinutes = watchedMinutes + estimatedLessonMinutes + estimatedTestMinutes;

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("coursesEnrolled", courseHistory.size());
            summary.put("lessonsCompleted", lessonsCompleted);
            summary.put("testsAttempted", testsAttempted);
            summary.put("timeSpentLearning", formatMinutesAsStudyTime(totalLearningMinutes));

            Map<String, Object> performanceSnapshot = new LinkedHashMap<>();
            performanceSnapshot.put("averageScore", roundToOneDecimal(resultRows.stream()
                    .mapToDouble(row -> ((Number) row.get("percentage")).doubleValue())
                    .average()
                    .orElse(0.0)));
            performanceSnapshot.put("totalCompletedCourses", (int) enrolledMaterials.stream().filter(material -> Boolean.TRUE.equals(material.getIsCompleted())).count());
            performanceSnapshot.put("learningStreak", calculateLearningStreak(completedChapters, resultRows, webinarProgressList));

            List<Map<String, Object>> timeline = buildLearningTimeline(completedChapters, resultRows, webinarProgressList, webinarInfoMap);

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("summary", summary);
            responseMap.put("performanceSnapshot", performanceSnapshot);
            responseMap.put("courses", courseHistory);
            responseMap.put("timeline", timeline);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("exception", e.getMessage());
            responseMap.put("status", Boolean.FALSE);
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    private Map<String, Object> buildCourseHistoryCard(MaterialEnrollmentDB enrollment) {
        LibraryMasterDB course = enrollment.getLibraryMasterDB();
        if (course == null) {
            return null;
        }

        int totalLessons = Optional.ofNullable(course.getChaptersDBList()).map(List::size).orElse(0);
        int completedLessons = Optional.ofNullable(enrollment.getEnrolledChaptersDBList())
                .orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                .toList()
                .size();
        double progressPercent = totalLessons == 0 ? (Boolean.TRUE.equals(enrollment.getIsCompleted()) ? 100.0 : 0.0) : (completedLessons * 100.0) / totalLessons;

        Map<String, Object> courseCard = new LinkedHashMap<>();
        courseCard.put("courseName", Optional.ofNullable(enrollment.getMaterialName()).orElse(course.getMaterialName()));
        courseCard.put("subject", resolveSubject(course));
        courseCard.put("completedLessons", completedLessons);
        courseCard.put("totalLessons", totalLessons);
        courseCard.put("progressPercent", roundToOneDecimal(progressPercent));
        courseCard.put("status", Boolean.TRUE.equals(enrollment.getIsCompleted()) ? "Completed" : "In Progress");
        courseCard.put("lastUpdated", formatDateLabel(enrollment.getUpdationTimeStamp()));
        return courseCard;
    }

    private Long resolveAuthorizedBatchId(Long studentId, Long requestedBatchId) {
        List<Long> studentBatchIds = lmsDaoInterf.fetchStudentBatchEnrollments(studentId)
                .orElse(Collections.emptyList())
                .stream()
                .map(BatchStudentEnrollmentsDB::getBatchDB)
                .filter(Objects::nonNull)
                .map(BatchDB::getBatchId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (requestedBatchId != null && studentBatchIds.contains(requestedBatchId)) {
            return requestedBatchId;
        }

        return studentBatchIds.stream().findFirst().orElse(null);
    }

    private MaterialEnrollmentDB buildCourseEnrollment(String userName, LibraryMasterDB course, String tutorName) {
        if (course == null || course.getMaterialId() == null) {
            return null;
        }

        MaterialEnrollmentDB enrollmentDB = new MaterialEnrollmentDB();
        enrollmentDB.setMaterialId(course.getMaterialId());
        enrollmentDB.setUsername(userName);
        enrollmentDB.setMaterialName(course.getMaterialName());
        enrollmentDB.setTutorName(tutorName);
        enrollmentDB.setLibraryMasterDB(course);
        enrollmentDB.setIsCompleted(Boolean.FALSE);
        enrollmentDB.setIsActive(Boolean.TRUE);
        enrollmentDB.setCreationTimeStamp(LocalDateTime.now());
        enrollmentDB.setUpdationTimeStamp(LocalDateTime.now());

        List<EnrolledChaptersDB> enrolledChapters = Optional.ofNullable(course.getChaptersDBList())
                .orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsActive()))
                .map(chapter -> buildEnrollmentChapter(userName, enrollmentDB, chapter))
                .toList();

        enrollmentDB.setEnrolledChaptersDBList(enrolledChapters);
        return enrollmentDB;
    }

    private String resolveTutorNameForCourse(LibraryMasterDB course, Long batchId) {
        if (course == null) {
            return "Unknown Tutor";
        }

        if (batchId != null) {
            Optional<String> batchTutorName = lmsDaoInterf.fetchBatchCourses(batchId)
                    .orElse(Collections.emptyList())
                    .stream()
                    .filter(batchCourse -> Boolean.TRUE.equals(batchCourse.getIsActive()))
                    .filter(batchCourse -> Objects.equals(batchCourse.getCourseId(), course.getMaterialId()))
                    .findFirst()
                    .flatMap(batchCourse -> lmsDaoInterf.getUserInfoById(batchCourse.getTutorId()).map(UserInfoDB::getFullName));

            if (batchTutorName.isPresent()) {
                return batchTutorName.get();
            }
        }

        return Optional.ofNullable(course.getUserInfoDB())
                .map(UserInfoDB::getFullName)
                .orElse("Unknown Tutor");
    }

    private EnrolledChaptersDB buildEnrollmentChapter(String userName,
                                                      MaterialEnrollmentDB enrollmentDB,
                                                      ChaptersDB chapter) {
        EnrolledChaptersDB enrolledChapter = new EnrolledChaptersDB();
        enrolledChapter.setChapterId(chapter.getChapterId());
        enrolledChapter.setChapterName(chapter.getChapterName());
        enrolledChapter.setUsername(userName);
        enrolledChapter.setIsCompleted(Boolean.FALSE);
        enrolledChapter.setIsActive(Boolean.TRUE);
        enrolledChapter.setMaterialEnrollmentDB(enrollmentDB);
        return enrolledChapter;
    }

    private Map<String, Object> buildDashboardSummaryPayload(String userName, Long batchId, Long studentId, String testTypeString) {
        List<MaterialEnrollmentDB> enrolledMaterials = lmsDaoInterf.fetchEnrolledMaterials(userName, Optional.of(Boolean.FALSE)).orElse(Collections.emptyList());
        List<EnrolledChaptersDB> completedChapters = lmsDaoInterf.fetchCompletedChapters(userName).orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                .toList();
        List<Map<String, Object>> resultRows = batchId != null
                ? buildAttemptedResultRows(batchId, studentId, resolveTestType(testTypeString))
                : Collections.emptyList();
        List<WebinarWatchProgress> webinarProgressList = webinarWatchProgressRepo.findByUsername(userName);

        LocalDate today = LocalDate.now();
        long studyTimeTodayMinutes = calculateStudyTimeTodayMinutes(completedChapters, resultRows, webinarProgressList, today);
        int coursesAccessedToday = countCoursesAccessedToday(enrolledMaterials, completedChapters, resultRows, today);
        int completionRate = calculateCompletionRate(enrolledMaterials);
        int learningStreak = calculateLearningStreak(completedChapters, resultRows, webinarProgressList);
        List<Map<String, Object>> weeklyProgress = buildWeeklyProgress(completedChapters, resultRows, webinarProgressList, completionRate, today);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("studyTime", formatMinutesAsStudyTime(studyTimeTodayMinutes));
        summary.put("studyTimeMinutes", studyTimeTodayMinutes);
        summary.put("coursesAccessed", coursesAccessedToday);
        summary.put("completionRate", completionRate);
        summary.put("streak", learningStreak);
        summary.put("streakLabel", learningStreak + (learningStreak == 1 ? " day" : " days"));
        summary.put("weeklyProgress", weeklyProgress);
        return summary;
    }

    private List<MaterialEnrollmentDB> prepareEnrollmentCourses(List<MaterialEnrollmentDB> enrollments, boolean markCompleted) {
        return enrollments.stream()
                .map(enrollment -> prepareEnrollmentCourse(enrollment, markCompleted))
                .filter(Objects::nonNull)
                .toList();
    }

    private MaterialEnrollmentDB prepareEnrollmentCourse(MaterialEnrollmentDB enrollment, boolean markCompleted) {
        if (enrollment == null) {
            return null;
        }

        LibraryMasterDB libraryMasterDB = resolveEnrollmentLibraryMaster(enrollment);
        if (libraryMasterDB == null) {
            return null;
        }

        enrollment.setLibraryMasterDB(libraryMasterDB);
        List<ChaptersDB> activeChapters = Optional.ofNullable(libraryMasterDB.getChaptersDBList())
                .orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsActive()))
                .sorted(Comparator.comparing(ChaptersDB::getChapterId, Comparator.nullsLast(Long::compareTo)))
                .toList();

        libraryMasterDB.setChaptersDBList(activeChapters);
        libraryMasterDB.setProgressPercentage(calculateEnrollmentProgress(enrollment, activeChapters.size(), markCompleted));

        if (libraryMasterDB.getSubjectMasterDB() != null) {
            libraryMasterDB.setSubjectId(libraryMasterDB.getSubjectMasterDB().getSubjectMasterId());
            libraryMasterDB.setSubjectName(libraryMasterDB.getSubjectMasterDB().getSubjectName());
        }

        if (libraryMasterDB.getUserInfoDB() != null) {
            libraryMasterDB.setAssignedTeacher(libraryMasterDB.getUserInfoDB().getFullName());
        }

        libraryMasterDB.setDiscountedPrice(calculateDiscountedPrice(libraryMasterDB.getMaterialPrice(), libraryMasterDB.getDiscountPercentage()));
        libraryMasterDB.setTestDB(null);

        if (enrollment.getMaterialName() == null || enrollment.getMaterialName().isBlank()) {
            enrollment.setMaterialName(libraryMasterDB.getMaterialName());
        }

        if (enrollment.getTutorName() == null || enrollment.getTutorName().isBlank()) {
            enrollment.setTutorName(
                    libraryMasterDB.getUserInfoDB() != null
                            ? libraryMasterDB.getUserInfoDB().getFullName()
                            : "Unknown Tutor"
            );
        }

        List<EnrolledChaptersDB> activeEnrollmentChapters = Optional.ofNullable(enrollment.getEnrolledChaptersDBList())
                .orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> activeChapters.stream().anyMatch(active -> Objects.equals(active.getChapterId(), chapter.getChapterId())))
                .sorted(Comparator.comparing(EnrolledChaptersDB::getChapterId, Comparator.nullsLast(Long::compareTo)))
                .toList();

        enrollment.setEnrolledChaptersDBList(activeEnrollmentChapters);
        if (markCompleted) {
            enrollment.setIsCompleted(Boolean.TRUE);
        }
        return enrollment;
    }

    private LibraryMasterDB resolveEnrollmentLibraryMaster(MaterialEnrollmentDB enrollment) {
        if (enrollment == null) {
            return null;
        }

        Long materialId = Optional.ofNullable(enrollment.getMaterialId())
                .orElseGet(() -> Optional.ofNullable(enrollment.getLibraryMasterDB())
                        .map(LibraryMasterDB::getMaterialId)
                        .orElse(null));

        if (materialId != null) {
            Optional<LibraryMasterDB> hydratedCourse = lmsDaoInterf.fetchActiveLibraryMasterById(materialId);
            if (hydratedCourse.isPresent()) {
                return hydratedCourse.get();
            }
        }

        return enrollment.getLibraryMasterDB();
    }

    private Integer calculateEnrollmentProgress(MaterialEnrollmentDB enrollment, int totalLessons, boolean markCompleted) {
        if (Boolean.TRUE.equals(markCompleted) || Boolean.TRUE.equals(enrollment.getIsCompleted())) {
            return 100;
        }
        if (totalLessons <= 0) {
            return 0;
        }

        long completedLessons = Optional.ofNullable(enrollment.getEnrolledChaptersDBList())
                .orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                .count();
        return (int) Math.round((completedLessons * 100.0) / totalLessons);
    }

    private List<MaterialEnrollmentDB> filterClassroomEnrollments(List<MaterialEnrollmentDB> enrollments) {
        return Optional.ofNullable(enrollments).orElse(Collections.emptyList())
                .stream()
                .filter(enrollment -> !isSkillProgram(enrollment))
                .toList();
    }

    private List<LibraryMasterDB> prepareAvailableLibraryCourses(String userName, Long batchId) {
        List<Long> enrolledMaterialIds = lmsDaoInterf.fetchEnrolledMaterials(userName, Optional.empty())
                .orElse(Collections.emptyList())
                .stream()
                .map(MaterialEnrollmentDB::getMaterialId)
                .filter(Objects::nonNull)
                .toList();

        List<LibraryMasterDB> publishedCourses = enrolledMaterialIds.isEmpty()
                ? lmsDaoInterf.fetchLibraryMaster().orElse(Collections.emptyList())
                : lmsDaoInterf.fetchLibraryMasterWhereMaterialIdIsNot(Boolean.TRUE, enrolledMaterialIds).orElse(Collections.emptyList());

        Map<Long, LibraryMasterDB> availableCourses = new LinkedHashMap<>();

        publishedCourses.stream()
                .filter(course -> Boolean.TRUE.equals(course.getIsActive()))
                .filter(course -> !isSkillProgram(course))
                .filter(course -> Boolean.TRUE.equals(course.getIsPublished()))
                .forEach(course -> availableCourses.put(course.getMaterialId(), course));

        if (batchId != null) {
            lmsDaoInterf.fetchBatchCourses(batchId)
                    .orElse(Collections.emptyList())
                    .stream()
                    .filter(batchCourse -> Boolean.TRUE.equals(batchCourse.getIsActive()))
                    .map(BatchCourseRelationEntity::getCourseId)
                    .filter(Objects::nonNull)
                    .filter(courseId -> !enrolledMaterialIds.contains(courseId))
                    .forEach(courseId -> lmsDaoInterf.fetchActiveLibraryMasterById(courseId)
                            .filter(course -> Boolean.TRUE.equals(course.getIsActive()) && !isSkillProgram(course))
                            .ifPresent(course -> availableCourses.put(course.getMaterialId(), course)));
        }

        return availableCourses.values().stream()
                .map(this::prepareLibraryCourse)
                .filter(Objects::nonNull)
                .toList();
    }

    private List<LibraryMasterDB> prepareAvailableSkillPrograms(String userName, Long batchId) {
        List<Long> enrolledMaterialIds = lmsDaoInterf.fetchEnrolledMaterials(userName, Optional.empty())
                .orElse(Collections.emptyList())
                .stream()
                .map(MaterialEnrollmentDB::getMaterialId)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, LibraryMasterDB> availablePrograms = new LinkedHashMap<>();

        lmsDaoInterf.fetchAllCourses(Pageable.unpaged())
                .map(page -> page.getContent())
                .orElse(Collections.emptyList())
                .stream()
                .filter(this::isSkillProgram)
                .filter(course -> course.getMaterialId() != null)
                .filter(course -> !enrolledMaterialIds.contains(course.getMaterialId()))
                .forEach(course -> availablePrograms.put(course.getMaterialId(), course));

        // Keep the old student-library flow as a fallback if the broader course query returns no skill programs.
        if (availablePrograms.isEmpty()) {
            prepareAvailableLibraryCourses(userName, batchId)
                    .stream()
                    .filter(this::isSkillProgram)
                    .forEach(course -> availablePrograms.put(course.getMaterialId(), course));
        }

        return availablePrograms.values().stream()
                .map(this::prepareLibraryCourse)
                .filter(Objects::nonNull)
                .toList();
    }

    private LibraryMasterDB prepareLibraryCourse(LibraryMasterDB libraryMasterDB) {
        if (libraryMasterDB == null) {
            return null;
        }

        if (libraryMasterDB.getSubjectMasterDB() != null) {
            libraryMasterDB.setSubjectId(libraryMasterDB.getSubjectMasterDB().getSubjectMasterId());
            libraryMasterDB.setSubjectName(libraryMasterDB.getSubjectMasterDB().getSubjectName());
        }

        if (libraryMasterDB.getUserInfoDB() != null) {
            libraryMasterDB.setAssignedTeacher(libraryMasterDB.getUserInfoDB().getFullName());
        }

        List<ChaptersDB> activeChapters = Optional.ofNullable(libraryMasterDB.getChaptersDBList())
                .orElse(Collections.emptyList())
                .stream()
                .filter(chapter -> Boolean.TRUE.equals(chapter.getIsActive()))
                .sorted(Comparator.comparing(ChaptersDB::getChapterId, Comparator.nullsLast(Long::compareTo)))
                .toList();

        libraryMasterDB.setChaptersDBList(activeChapters);
        libraryMasterDB.setDiscountedPrice(calculateDiscountedPrice(libraryMasterDB.getMaterialPrice(), libraryMasterDB.getDiscountPercentage()));
        libraryMasterDB.setProgressPercentage(0);
        libraryMasterDB.setTestDB(null);
        return libraryMasterDB;
    }

    private List<Map<String, Object>> buildMyCourseSubjects(List<MaterialEnrollmentDB> inProgressCourses, List<MaterialEnrollmentDB> completedCourses) {
        LinkedHashMap<String, Map<String, Object>> subjectMap = new LinkedHashMap<>();

        Stream.concat(inProgressCourses.stream(), completedCourses.stream())
                .map(MaterialEnrollmentDB::getLibraryMasterDB)
                .filter(Objects::nonNull)
                .forEach(course -> {
                    String subjectName = resolveSubject(course);
                    if (subjectName == null || subjectName.isBlank()) {
                        return;
                    }

                    Map<String, Object> subjectRow = subjectMap.computeIfAbsent(subjectName, key -> {
                        Map<String, Object> value = new LinkedHashMap<>();
                        value.put("subjectName", key);
                        value.put("subjectMasterId", course.getSubjectId());
                        return value;
                    });

                    if (subjectRow.get("subjectMasterId") == null && course.getSubjectId() != null) {
                        subjectRow.put("subjectMasterId", course.getSubjectId());
                    }
                });

        return new ArrayList<>(subjectMap.values());
    }

    private List<Map<String, Object>> buildStudentCourseCards(List<MaterialEnrollmentDB> inProgressCourses,
                                                              List<MaterialEnrollmentDB> completedCourses) {
        return Stream.concat(inProgressCourses.stream(), completedCourses.stream())
                .filter(Objects::nonNull)
                .map(this::buildStudentCourseCard)
                .filter(Objects::nonNull)
                .toList();
    }

    private Map<String, Object> buildStudentCourseCard(MaterialEnrollmentDB enrollment) {
        LibraryMasterDB course = enrollment.getLibraryMasterDB();
        if (course == null) {
            return null;
        }

        List<ChaptersDB> lessons = Optional.ofNullable(course.getChaptersDBList()).orElse(Collections.emptyList());
        int totalLessons = lessons.size();
        int progress = Optional.ofNullable(course.getProgressPercentage()).orElseGet(() ->
                calculateEnrollmentProgress(enrollment, totalLessons, Boolean.TRUE.equals(enrollment.getIsCompleted()))
        );

        Map<String, Object> courseCard = new LinkedHashMap<>();
        courseCard.put("id", course.getMaterialId());
        courseCard.put("title", Optional.ofNullable(enrollment.getMaterialName()).orElse(course.getMaterialName()));
        courseCard.put("instructor", Optional.ofNullable(enrollment.getTutorName()).orElse(course.getAssignedTeacher()));
        courseCard.put("progress", progress);
        courseCard.put("status", Boolean.TRUE.equals(enrollment.getIsCompleted()) ? "completed" : (progress > 0 ? "in-progress" : "assigned"));
        courseCard.put("totalLessons", totalLessons);
        courseCard.put("subject", resolveSubject(course));
        return courseCard;
    }

    private Map<String, Object> buildSkillProgramsPayload(Long batchId,
                                                          List<LibraryMasterDB> libraryCourses,
                                                          List<MaterialEnrollmentDB> inProgressCourses,
                                                          List<MaterialEnrollmentDB> completedCourses) {
        List<LibraryMasterDB> libraryPrograms = Optional.ofNullable(libraryCourses).orElse(Collections.emptyList())
                .stream()
                .filter(this::isSkillProgram)
                .toList();
        List<MaterialEnrollmentDB> inProgressPrograms = Optional.ofNullable(inProgressCourses).orElse(Collections.emptyList())
                .stream()
                .filter(this::isSkillProgram)
                .toList();
        List<MaterialEnrollmentDB> completedPrograms = Optional.ofNullable(completedCourses).orElse(Collections.emptyList())
                .stream()
                .filter(this::isSkillProgram)
                .toList();

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("batchId", batchId);
        payload.put("libraryPrograms", libraryPrograms);
        payload.put("inProgressPrograms", inProgressPrograms);
        payload.put("completedPrograms", completedPrograms);
        payload.put("programs", buildStudentSkillProgramCards(libraryPrograms, inProgressPrograms, completedPrograms));
        payload.put("summary", buildSkillProgramSummary(libraryPrograms, inProgressPrograms, completedPrograms));
        payload.put("subjects", buildMyCourseSubjects(inProgressPrograms, completedPrograms));
        return payload;
    }

    private List<Map<String, Object>> buildStudentSkillProgramCards(List<LibraryMasterDB> libraryPrograms,
                                                                    List<MaterialEnrollmentDB> inProgressPrograms,
                                                                    List<MaterialEnrollmentDB> completedPrograms) {
        Stream<Map<String, Object>> libraryProgramCards = Optional.ofNullable(libraryPrograms).orElse(Collections.emptyList())
                .stream()
                .map(program -> buildStudentSkillProgramCard(program, "library", 0));
        Stream<Map<String, Object>> inProgressProgramCards = Optional.ofNullable(inProgressPrograms).orElse(Collections.emptyList())
                .stream()
                .map(program -> buildStudentSkillProgramCard(program, "in-progress", null));
        Stream<Map<String, Object>> completedProgramCards = Optional.ofNullable(completedPrograms).orElse(Collections.emptyList())
                .stream()
                .map(program -> buildStudentSkillProgramCard(program, "completed", 100));

        return Stream.of(libraryProgramCards, inProgressProgramCards, completedProgramCards)
                .flatMap(stream -> stream)
                .filter(Objects::nonNull)
                .toList();
    }

    private Map<String, Object> buildStudentSkillProgramCard(LibraryMasterDB libraryMasterDB,
                                                             String status,
                                                             Integer forcedProgress) {
        if (libraryMasterDB == null) {
            return null;
        }

        int totalLessons = Optional.ofNullable(libraryMasterDB.getChaptersDBList()).orElse(Collections.emptyList()).size();
        int progress = forcedProgress != null
                ? forcedProgress
                : Optional.ofNullable(libraryMasterDB.getProgressPercentage()).orElse(0);

        LinkedHashMap<String, Object> programCard = new LinkedHashMap<>();
        programCard.put("id", libraryMasterDB.getMaterialId());
        programCard.put("title", libraryMasterDB.getMaterialName());
        programCard.put("instructor", Optional.ofNullable(libraryMasterDB.getAssignedTeacher())
                .orElseGet(() -> libraryMasterDB.getUserInfoDB() != null ? libraryMasterDB.getUserInfoDB().getFullName() : null));
        programCard.put("progress", progress);
        programCard.put("status", status);
        programCard.put("totalLessons", totalLessons);
        programCard.put("subject", resolveSubject(libraryMasterDB));
        return programCard;
    }

    private Map<String, Object> buildStudentSkillProgramCard(MaterialEnrollmentDB enrollment,
                                                             String status,
                                                             Integer forcedProgress) {
        if (enrollment == null || enrollment.getLibraryMasterDB() == null) {
            return null;
        }

        LibraryMasterDB course = enrollment.getLibraryMasterDB();
        List<ChaptersDB> lessons = Optional.ofNullable(course.getChaptersDBList()).orElse(Collections.emptyList());
        int progress = forcedProgress != null
                ? forcedProgress
                : Optional.ofNullable(course.getProgressPercentage()).orElseGet(() ->
                        calculateEnrollmentProgress(enrollment, lessons.size(), Boolean.TRUE.equals(enrollment.getIsCompleted()))
                );

        LinkedHashMap<String, Object> programCard = new LinkedHashMap<>();
        programCard.put("id", course.getMaterialId());
        programCard.put("title", Optional.ofNullable(enrollment.getMaterialName()).orElse(course.getMaterialName()));
        programCard.put("instructor", Optional.ofNullable(enrollment.getTutorName()).orElse(course.getAssignedTeacher()));
        programCard.put("progress", progress);
        programCard.put("status", status);
        programCard.put("totalLessons", lessons.size());
        programCard.put("subject", resolveSubject(course));
        return programCard;
    }

    private Map<String, Object> buildSkillProgramSummary(List<LibraryMasterDB> libraryPrograms,
                                                         List<MaterialEnrollmentDB> inProgressPrograms,
                                                         List<MaterialEnrollmentDB> completedPrograms) {
        List<MaterialEnrollmentDB> enrolledPrograms = Stream.concat(
                Optional.ofNullable(inProgressPrograms).orElse(Collections.emptyList()).stream(),
                Optional.ofNullable(completedPrograms).orElse(Collections.emptyList()).stream()
        ).toList();

        int totalLessons = enrolledPrograms.stream()
                .map(MaterialEnrollmentDB::getLibraryMasterDB)
                .filter(Objects::nonNull)
                .map(LibraryMasterDB::getChaptersDBList)
                .filter(Objects::nonNull)
                .mapToInt(List::size)
                .sum();

        int completedLessons = enrolledPrograms.stream()
                .mapToInt(enrollment -> {
                    List<EnrolledChaptersDB> enrolledChapters = Optional.ofNullable(enrollment.getEnrolledChaptersDBList())
                            .orElse(Collections.emptyList());
                    if (Boolean.TRUE.equals(enrollment.getIsCompleted())) {
                        return enrolledChapters.isEmpty()
                                ? Optional.ofNullable(enrollment.getLibraryMasterDB())
                                        .map(LibraryMasterDB::getChaptersDBList)
                                        .map(List::size)
                                        .orElse(0)
                                : enrolledChapters.size();
                    }

                    return (int) enrolledChapters.stream()
                            .filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted()))
                            .count();
                })
                .sum();

        LinkedHashMap<String, Object> summary = new LinkedHashMap<>();
        summary.put("libraryCount", Optional.ofNullable(libraryPrograms).orElse(Collections.emptyList()).size());
        summary.put("inProgressCount", Optional.ofNullable(inProgressPrograms).orElse(Collections.emptyList()).size());
        summary.put("completedCount", Optional.ofNullable(completedPrograms).orElse(Collections.emptyList()).size());
        summary.put("completionRate", totalLessons > 0 ? Math.round((completedLessons * 100.0f) / totalLessons) : 0);
        return summary;
    }

    private boolean isSkillProgram(MaterialEnrollmentDB enrollment) {
        return enrollment != null && isSkillProgram(enrollment.getLibraryMasterDB());
    }

    private boolean isSkillProgram(LibraryMasterDB libraryMasterDB) {
        return libraryMasterDB != null && Boolean.TRUE.equals(libraryMasterDB.getIsCertificationRequired());
    }

    private long calculateStudyTimeTodayMinutes(List<EnrolledChaptersDB> completedChapters,
                                                List<Map<String, Object>> resultRows,
                                                List<WebinarWatchProgress> webinarProgressList,
                                                LocalDate today) {
        long lessonMinutes = completedChapters.stream()
                .map(EnrolledChaptersDB::getUpdationTimeStamp)
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalDate)
                .filter(today::equals)
                .count() * 25L;

        long testMinutes = resultRows.stream()
                .filter(row -> Objects.equals(extractLocalDate(row.get("dateAttempted")), today))
                .mapToLong(row -> Math.max(15L, Math.round(((Number) row.getOrDefault("answeredQuestions", 0)).doubleValue() * 2.5)))
                .sum();

        long webinarMinutes = Math.round(webinarProgressList.stream()
                .filter(progress -> Objects.equals(extractLocalDate(progress.getUpdationTimeStamp()), today))
                .map(WebinarWatchProgress::getWatchedSeconds)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum() / 60.0);

        return lessonMinutes + testMinutes + webinarMinutes;
    }

    private int countCoursesAccessedToday(List<MaterialEnrollmentDB> enrolledMaterials,
                                          List<EnrolledChaptersDB> completedChapters,
                                          List<Map<String, Object>> resultRows,
                                          LocalDate today) {
        Set<Long> accessedMaterialIds = new HashSet<>();

        enrolledMaterials.stream()
                .filter(enrollment -> Objects.equals(extractLocalDate(enrollment.getUpdationTimeStamp()), today))
                .map(MaterialEnrollmentDB::getMaterialId)
                .filter(Objects::nonNull)
                .forEach(accessedMaterialIds::add);

        completedChapters.stream()
                .filter(chapter -> Objects.equals(extractLocalDate(chapter.getUpdationTimeStamp()), today))
                .map(EnrolledChaptersDB::getMaterialEnrollmentDB)
                .filter(Objects::nonNull)
                .map(MaterialEnrollmentDB::getMaterialId)
                .filter(Objects::nonNull)
                .forEach(accessedMaterialIds::add);

        resultRows.stream()
                .filter(row -> Objects.equals(extractLocalDate(row.get("dateAttempted")), today))
                .map(row -> (Long) row.get("materialId"))
                .filter(Objects::nonNull)
                .forEach(accessedMaterialIds::add);

        return accessedMaterialIds.size();
    }

    private int calculateCompletionRate(List<MaterialEnrollmentDB> enrolledMaterials) {
        int totalLessons = enrolledMaterials.stream()
                .map(MaterialEnrollmentDB::getLibraryMasterDB)
                .filter(Objects::nonNull)
                .map(LibraryMasterDB::getChaptersDBList)
                .filter(Objects::nonNull)
                .mapToInt(List::size)
                .sum();

        int completedLessons = enrolledMaterials.stream()
                .map(MaterialEnrollmentDB::getEnrolledChaptersDBList)
                .filter(Objects::nonNull)
                .mapToInt(chapters -> (int) chapters.stream().filter(chapter -> Boolean.TRUE.equals(chapter.getIsCompleted())).count())
                .sum();

        if (totalLessons <= 0) {
            long completedCourses = enrolledMaterials.stream().filter(enrollment -> Boolean.TRUE.equals(enrollment.getIsCompleted())).count();
            return completedCourses > 0 ? 100 : 0;
        }

        return (int) Math.round((completedLessons * 100.0) / totalLessons);
    }

    private List<Map<String, Object>> buildWeeklyProgress(List<EnrolledChaptersDB> completedChapters,
                                                          List<Map<String, Object>> resultRows,
                                                          List<WebinarWatchProgress> webinarProgressList,
                                                          int completionRate,
                                                          LocalDate today) {
        List<Map<String, Object>> weeklyProgress = new ArrayList<>();

        for (int index = 6; index >= 0; index--) {
            LocalDate day = today.minusDays(index);

            long lessonMinutes = completedChapters.stream()
                    .map(EnrolledChaptersDB::getUpdationTimeStamp)
                    .filter(Objects::nonNull)
                    .map(LocalDateTime::toLocalDate)
                    .filter(day::equals)
                    .count() * 25L;

            long testMinutes = resultRows.stream()
                    .filter(row -> Objects.equals(extractLocalDate(row.get("dateAttempted")), day))
                    .mapToLong(row -> Math.max(15L, Math.round(((Number) row.getOrDefault("answeredQuestions", 0)).doubleValue() * 2.5)))
                    .sum();

            long webinarMinutes = Math.round(webinarProgressList.stream()
                    .filter(progress -> Objects.equals(extractLocalDate(progress.getUpdationTimeStamp()), day))
                    .map(WebinarWatchProgress::getWatchedSeconds)
                    .filter(Objects::nonNull)
                    .mapToDouble(Double::doubleValue)
                    .sum() / 60.0);

            long totalMinutes = lessonMinutes + testMinutes + webinarMinutes;
            int value = totalMinutes <= 0
                    ? 8
                    : (int) Math.min(100, Math.max(12, Math.round((totalMinutes / 180.0) * 100 + (completionRate * 0.2))));

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("label", day.getDayOfWeek().name().substring(0, 2));
            point.put("value", value);
            point.put("active", day.equals(today));
            point.put("date", day.toString());
            point.put("minutes", totalMinutes);
            weeklyProgress.add(point);
        }

        return weeklyProgress;
    }

    private LocalDate extractLocalDate(Object value) {
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toLocalDate();
        }
        if (value instanceof LocalDate date) {
            return date;
        }
        return null;
    }

    private List<Map<String, Object>> buildLearningTimeline(List<EnrolledChaptersDB> completedChapters,
                                                            List<Map<String, Object>> resultRows,
                                                            List<WebinarWatchProgress> webinarProgressList,
                                                            Map<Long, WebinarInfo> webinarInfoMap) {
        List<Map<String, Object>> timeline = new ArrayList<>();

        completedChapters.forEach(chapter -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("type", "Completed lesson");
            entry.put("title", Optional.ofNullable(chapter.getChapterName()).orElse("Completed chapter"));
            entry.put("subject", Optional.ofNullable(chapter.getMaterialEnrollmentDB())
                    .map(MaterialEnrollmentDB::getMaterialName)
                    .orElse("Course"));
            entry.put("dateTime", chapter.getUpdationTimeStamp());
            entry.put("dateLabel", formatDateLabel(chapter.getUpdationTimeStamp()));
            timeline.add(entry);
        });

        resultRows.forEach(result -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("type", "Attempted test");
            entry.put("title", result.get("testName"));
            entry.put("subject", result.get("subject"));
            entry.put("dateTime", result.get("dateAttempted"));
            entry.put("dateLabel", result.get("dateLabel"));
            timeline.add(entry);
        });

        webinarProgressList.forEach(progress -> {
            WebinarInfo webinarInfo = webinarInfoMap.get(progress.getWebinarInfoId());
            if (webinarInfo == null) {
                return;
            }

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("type", "Watched recording");
            entry.put("title", webinarInfo.getWebinarName());
            entry.put("subject", webinarInfo.getSubjectMasterDB() != null ? webinarInfo.getSubjectMasterDB().getSubjectName() : "Webinar");
            entry.put("dateTime", progress.getUpdationTimeStamp());
            entry.put("dateLabel", formatDateLabel(progress.getUpdationTimeStamp()));
            timeline.add(entry);
        });

        return timeline.stream()
                .sorted(Comparator.comparing((Map<String, Object> entry) -> (LocalDateTime) entry.get("dateTime"), Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .limit(10)
                .toList();
    }

    private int calculateLearningStreak(List<EnrolledChaptersDB> completedChapters,
                                        List<Map<String, Object>> resultRows,
                                        List<WebinarWatchProgress> webinarProgressList) {
        TreeSet<LocalDate> activeDates = new TreeSet<>();

        completedChapters.stream()
                .map(EnrolledChaptersDB::getUpdationTimeStamp)
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalDate)
                .forEach(activeDates::add);

        resultRows.stream()
                .map(row -> (LocalDateTime) row.get("dateAttempted"))
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalDate)
                .forEach(activeDates::add);

        webinarProgressList.stream()
                .map(WebinarWatchProgress::getUpdationTimeStamp)
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalDate)
                .forEach(activeDates::add);

        if (activeDates.isEmpty()) {
            return 0;
        }

        int streak = 0;
        LocalDate cursor = activeDates.last();
        while (activeDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private String formatMinutesAsStudyTime(long totalMinutes) {
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;

        if (hours <= 0) {
            return minutes + " mins";
        }
        return hours + "h " + minutes + "m";
    }

    private double calculateDiscountedPrice(Double materialPrice, Double discountPercentage) {
        double safePrice = materialPrice != null ? materialPrice : 0.0;
        double safeDiscount = discountPercentage != null ? discountPercentage : 0.0;

        if (safePrice <= 0 || safeDiscount <= 0) {
            return safePrice;
        }

        return Math.max(0.0, safePrice - ((safePrice * safeDiscount) / 100.0));
    }


    @Override
    public ResponseEntity<Map<String, Object>> fetchHelpAndSupportStudentWise(String userName){

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(userName.trim());

            if(userInfoDB.isPresent()) {

                LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);

                // fetch HelpAndSupport DB
                Optional<List<HelpAndSupportEntity>> presentHelpAndSupportStudentWise = lmsDaoInterf.findHelpAndSupportStudentWise(userInfoDB.get().getUserDetailsId(), threeMonthsAgo);

                // check if List is present
                if (presentHelpAndSupportStudentWise.isEmpty()) {
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.internalServerError().body(responseMap);
                } else {
                    List<HelpAndSupportEntity> supportEntities = presentHelpAndSupportStudentWise.get();
                    supportEntities.forEach(helpAndSupportEntity -> {
                        if (helpAndSupportEntity.getTicketId() == null || helpAndSupportEntity.getTicketId().isBlank()) {
                            helpAndSupportEntity.setTicketId("TKT-" + helpAndSupportEntity.getGrievanceId());
                        }

                        if (Boolean.TRUE.equals(helpAndSupportEntity.getIsResolved())) {
                            helpAndSupportEntity.setIssueStatus("Resolved");
                        } else if (helpAndSupportEntity.getAdminReply() != null && !helpAndSupportEntity.getAdminReply().isBlank()) {
                            helpAndSupportEntity.setIssueStatus("In Progress");
                        } else {
                            helpAndSupportEntity.setIssueStatus("Open");
                        }

                        if (helpAndSupportEntity.getPriorityLevel() == null || helpAndSupportEntity.getPriorityLevel().isBlank()) {
                            helpAndSupportEntity.setPriorityLevel("Medium");
                        }

                        if (helpAndSupportEntity.getIssueCategory() == null || helpAndSupportEntity.getIssueCategory().isBlank()) {
                            helpAndSupportEntity.setIssueCategory("Other");
                        }

                        if (helpAndSupportEntity.getIssueTitle() == null || helpAndSupportEntity.getIssueTitle().isBlank()) {
                            String complaintMessage = Optional.ofNullable(helpAndSupportEntity.getComplaintMessage()).orElse("Support issue");
                            helpAndSupportEntity.setIssueTitle(complaintMessage.length() > 40 ? complaintMessage.substring(0, 40) + "..." : complaintMessage);
                        }
                    });

                    responseMap.put("data", supportEntities);
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);
                }
            }

            responseMap.put("message", "User not found");
            responseMap.put("status", Boolean.FALSE);
            return ResponseEntity.unprocessableEntity().body(responseMap);

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("exception", e.getMessage());
            responseMap.put("status", Boolean.FALSE);

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchSupportFaqs() {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            List<Map<String, Object>> faqs = new ArrayList<>();
            faqs.add(buildFaqRow("How to enroll in a course?", "Open Content Library, choose an available course, and use the enroll option provided for your batch or assigned learning path."));
            faqs.add(buildFaqRow("How to submit assignments?", "Go to Assignments & Practice, open the active task, upload your work or answer the required questions, and submit before the deadline."));
            faqs.add(buildFaqRow("How to access recordings?", "Open Webinars to watch recorded sessions, or use the Resume Watching option to continue from your saved progress."));
            faqs.add(buildFaqRow("How do I resume a test or webinar?", "The LMS saves your latest progress and shows Resume actions on exams and recorded webinars whenever draft or watch progress is available."));
            faqs.add(buildFaqRow("When will my issue be resolved?", "Support tickets usually move from Open to In Progress and then Resolved once the team reviews and responds to your concern."));

            Map<String, Object> contact = new LinkedHashMap<>();
            contact.put("phone", "(+91) 82278 72722");
            contact.put("email", "support@skilllms.in");
            contact.put("chatLabel", "Live chat coming soon");

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("faqs", faqs);
            responseMap.put("contact", contact);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("exception", e.getMessage());
            responseMap.put("status", Boolean.FALSE);
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    private Map<String, Object> buildFaqRow(String question, String answer) {
        Map<String, Object> faq = new LinkedHashMap<>();
        faq.put("question", question);
        faq.put("answer", answer);
        return faq;
    }
}
