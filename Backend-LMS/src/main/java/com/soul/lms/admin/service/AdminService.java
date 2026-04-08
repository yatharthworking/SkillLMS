package com.soul.lms.admin.service;

import com.google.common.base.Strings;
import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.masters.service.MastersService;
import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import com.soul.lms.model.entity.announcement.AnnouncementReadEntity;
import com.soul.lms.model.entity.batchenrollment.BatchEnrollmentEntity;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.batchrelation.BatchTestRelationEntity;
import com.soul.lms.model.entity.modelmasters.CountryMaster;
import com.soul.lms.model.entity.modelmasters.CourseMaster;
import com.soul.lms.model.entity.tests.enumentity.TestPattern;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import com.soul.lms.model.entity.modelmasters.masterentitydb.*;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import com.soul.lms.model.entity.studymaterial.ChaptersDB;
import com.soul.lms.model.entity.studymaterial.EnrolledChaptersDB;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import com.soul.lms.model.entity.studymaterial.MaterialDescDB;
import com.soul.lms.model.entity.studymaterial.MaterialEnrollmentDB;
import com.soul.lms.model.entity.tests.testresponse.TestAnswerResponse;
import com.soul.lms.model.entity.tests.testresponse.TestQuestionResponse;
import com.soul.lms.model.entity.tests.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service("adminService")
public class AdminService implements AdminServiceInterf {

    private final LmsDaoInterf lmsDaoInterf;

    @Autowired
    public AdminService(LmsDaoInterf lmsDaoInterf) {
        this.lmsDaoInterf = lmsDaoInterf;
    }

    //logger
    private final Logger logger = LogManager.getLogger(AdminService.class);

    private Map<String, Object> mapAnnouncementResponse(AnnouncementEntity announcementEntity) {
        LinkedHashMap<String, Object> announcementMap = new LinkedHashMap<>();
        BatchDB batchDB = announcementEntity.getBatchDB();

        announcementMap.put("announcementId", announcementEntity.getAnnouncementId());
        announcementMap.put("announcementTitle", announcementEntity.getAnnouncementTitle());
        announcementMap.put("announcementMessage", announcementEntity.getAnnouncementMessage());
        announcementMap.put("announcementById", announcementEntity.getAnnouncementById());
        announcementMap.put("announcementByName", announcementEntity.getAnnouncementByName());
        announcementMap.put("isActive", announcementEntity.getIsActive());
        announcementMap.put("batchId", batchDB != null ? batchDB.getBatchId() : announcementEntity.getBatchId());
        announcementMap.put("batchName", batchDB != null ? batchDB.getBatchName() : announcementEntity.getBatchName());
        announcementMap.put("createdBy", announcementEntity.getCreatedBy());
        announcementMap.put("updatedBy", announcementEntity.getUpdatedBy());
        announcementMap.put("creationTimeStamp", announcementEntity.getCreationTimeStamp());
        announcementMap.put("updationTimeStamp", announcementEntity.getUpdationTimeStamp());
        return announcementMap;
    }

    private Set<Long> getActiveAnnouncementRecipientIds(BatchDB batchDB) {
        LinkedHashSet<Long> recipientIds = new LinkedHashSet<>();

        Optional.ofNullable(batchDB.getBatchStudentEnrollmentsDB())
                .orElseGet(Collections::emptyList)
                .stream()
                .filter(BatchStudentEnrollmentsDB::getIsActive)
                .map(BatchStudentEnrollmentsDB::getStudentId)
                .filter(Objects::nonNull)
                .forEach(recipientIds::add);

        Optional.ofNullable(batchDB.getBatchTutorEnrollmentsDB())
                .orElseGet(Collections::emptyList)
                .stream()
                .filter(BatchTutorEnrollmentDB::getIsActive)
                .map(BatchTutorEnrollmentDB::getTutorId)
                .filter(Objects::nonNull)
                .forEach(recipientIds::add);

        return recipientIds;
    }

    private boolean syncAnnouncementReadRecipients(AnnouncementEntity announcementEntity, BatchDB batchDB, Long actorUserId, boolean resetReadStatus) {
        List<AnnouncementReadEntity> existingReadEntries = lmsDaoInterf
                .fetchAnnouncementReadByAnnouncementId(announcementEntity.getAnnouncementId())
                .orElseGet(Collections::emptyList);

        Map<Long, AnnouncementReadEntity> existingReadByUserId = existingReadEntries.stream()
                .filter(readEntity -> readEntity.getStudentId() != null)
                .collect(Collectors.toMap(
                        AnnouncementReadEntity::getStudentId,
                        readEntity -> readEntity,
                        (existing, duplicate) -> existing,
                        LinkedHashMap::new
                ));

        boolean allSaved = true;
        for (Long recipientId : getActiveAnnouncementRecipientIds(batchDB)) {
            AnnouncementReadEntity existingRead = existingReadByUserId.get(recipientId);

            if (existingRead == null) {
                AnnouncementReadEntity newAnnouncementRead = new AnnouncementReadEntity();
                newAnnouncementRead.setAnnouncementId(announcementEntity.getAnnouncementId());
                newAnnouncementRead.setStudentId(recipientId);
                newAnnouncementRead.setMarkAsRead(Boolean.FALSE);
                if (actorUserId != null) {
                    newAnnouncementRead.setCreatedBy(actorUserId);
                }
                allSaved = lmsDaoInterf.persistAnnouncementRead(newAnnouncementRead) && allSaved;
            } else if (resetReadStatus) {
                existingRead.setMarkAsRead(Boolean.FALSE);
                if (actorUserId != null) {
                    existingRead.setUpdatedBy(actorUserId);
                }
                allSaved = lmsDaoInterf.persistAnnouncementRead(existingRead) && allSaved;
            }
        }

        return allSaved;
    }


    // service layer for objective submission of test
    @Override
    public ResponseEntity<Map<String, Object>> courseObjectiveTestSubmit(List<ObjectiveTestSubmit> objectiveTestSubmit) {

        // create new Hashmap for response
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // using for each for multiple answers
            objectiveTestSubmit.forEach(testSubmit1 -> {

                // extracting information using the username
                Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(testSubmit1.getUserName());
                // extracting and setting userId if present
                userInfo.ifPresent(userInfoDB -> testSubmit1.setStudentId(userInfoDB.getUserDetailsId()));

                testSubmit1.setCreatedBy(testSubmit1.getStudentId());
            });

            Optional<TestStudentRelation> relationIsPresent = lmsDaoInterf.fetchTestUnAttempt(objectiveTestSubmit.getFirst().getTestId(),objectiveTestSubmit.getFirst().getStudentId());

            // saving to DB
            Boolean isSaved = lmsDaoInterf.submitObjectiveTest(objectiveTestSubmit);

            // checking if saved in DB and returning response
            if (isSaved) {

                Boolean isAttemptSaved;

                if(relationIsPresent.isPresent()) {

                    relationIsPresent.get().setIsTestAttempted(Boolean.TRUE);

                    isAttemptSaved = lmsDaoInterf.saveAttempt(relationIsPresent.get());

                } else {

                    TestStudentRelation attempt = new TestStudentRelation();
                    attempt.setIsTestAttempted(Boolean.TRUE);
                    attempt.setTestId(objectiveTestSubmit.getFirst().getTestId());
                    attempt.setStudentId(objectiveTestSubmit.getFirst().getStudentId());

                    isAttemptSaved = lmsDaoInterf.saveAttempt(attempt);
                }

                if(isAttemptSaved){

                    responseMap.put("message", "saved attempt and submission");
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("message", "saved test submission");
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.internalServerError().body(responseMap);
            }

        } catch (Exception e) {
            System.out.println("exception " + e.getMessage());
            logger.error(e.fillInStackTrace());
            logger.catching(e);
            throw new RuntimeException(e);
        }

    }


    // service layer for subjective submission of test
    @Override
    public ResponseEntity<Map<String, Object>> courseSubjectiveTestSubmit(List<SubjectiveTestSubmit> subjectiveTestSubmit) {

        // create new Hashmap for response
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // using for each for multiple answers
            subjectiveTestSubmit.forEach(testSubmit1 -> {

                // extracting information using the username
                Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(testSubmit1.getUserName());
                // extracting and setting userId if present
                userInfo.ifPresent(userInfoDB -> testSubmit1.setStudentId(userInfoDB.getUserDetailsId()));

                testSubmit1.setCreatedBy(testSubmit1.getStudentId());
            });

            Optional<TestStudentRelation> relationIsPresent = lmsDaoInterf.fetchTestUnAttempt(subjectiveTestSubmit.getFirst().getTestId(),subjectiveTestSubmit.getFirst().getStudentId());

            // saving to DB
            Boolean isSaved = lmsDaoInterf.submitSubjectiveTest(subjectiveTestSubmit);

            // checking if saved in DB and returning response
            if (isSaved) {

                Boolean isAttemptSaved;

                if(relationIsPresent.isPresent()) {

                    relationIsPresent.get().setIsTestAttempted(Boolean.TRUE);

                    isAttemptSaved = lmsDaoInterf.saveAttempt(relationIsPresent.get());

                } else {

                    TestStudentRelation attempt = new TestStudentRelation();
                    attempt.setIsTestAttempted(Boolean.TRUE);
                    attempt.setTestId(subjectiveTestSubmit.getFirst().getTestId());
                    attempt.setStudentId(subjectiveTestSubmit.getFirst().getStudentId());

                    isAttemptSaved = lmsDaoInterf.saveAttempt(attempt);
                }

                if(isAttemptSaved){

                    responseMap.put("message", "saved attempt and submission");
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("message", "saved submission");
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.internalServerError().body(responseMap);
            }

        } catch (Exception e) {
            System.out.println("exception " + e.getMessage());
            logger.error(e.fillInStackTrace());
            logger.catching(e);
            throw new RuntimeException(e);
        }

    }


    // service layer to fetch the test questions, answers and correct answers
    @Override
    public ResponseEntity<Map<String, Object>> fetchTestSubmissions(Long testId, String userName, String testPattern) {
        HashMap<String, Object> responseMap = new HashMap<>();
        try {
            // extracting information using the username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // extracting and setting userId if present, otherwise set to null
            Long studentId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            // Checking if test is present in the DB
            if (studentId != null && !Strings.isNullOrEmpty(testPattern)) {
                Optional<TestStudentRelation> attemptedTests = lmsDaoInterf.fetchTestAttempt(testId, studentId);

                if (attemptedTests.isPresent()) {
                    // extracting test by its id from DB
                    Optional<TestDB> optionalTest = lmsDaoInterf.findActiveAndPublishedTestById(testId);

                    if (optionalTest.isPresent()) {
                        // extract test details
                        TestDB testDB = optionalTest.get();

                        // extract list of questions for the test
                        List<TestQuestionsDB> questions = lmsDaoInterf.findByTestDB(testDB);

                        // Map each question to a TestQuestionResponse
                        List<TestQuestionResponse> questionResponses = questions.stream().map(question -> {
                            // Retrieve the list of answers for the current question
                            List<TestAnswersDB> answers = lmsDaoInterf.findByTestQuestionsDB(question);

                            // Retrieve the correct answer for the current question
                            CorrectAnswerDB correctAnswer = lmsDaoInterf.findByCorrectTestQuestionsDB(question);

                            List<TestAnswerResponse> answerResponses = new ArrayList<>();

                            if ("OBJECTIVE".equalsIgnoreCase(testPattern)) {
                                // Retrieve the list of submissions for the current question, test, and student
                                List<ObjectiveTestSubmit> submissions1 = lmsDaoInterf.findObjectviteTestByTestIdAndStudentIdAndQuestionId(
                                        testId, studentId, question.getQuestionId());

                                // Map each answer to a TestAnswerResponse
                                answerResponses = answers.stream().map(answer -> {
                                    // Check if the current answer is correct
                                    boolean isCorrect = correctAnswer.getTestAnswersDB().getAnswerId().equals(answer.getAnswerId());
                                    // Check if the current answer has been submitted by the student
                                    boolean isSubmitted = submissions1.stream().anyMatch(submission -> submission.getSubmittedAnswerId().equals(answer.getAnswerId()));
                                    // return the response for the current answer
                                    return new TestAnswerResponse(answer.getAnswerId(), answer.getAnswer(), isCorrect, isSubmitted);
                                }).toList();
                            }

                            if ("SUBJECTIVE".equalsIgnoreCase(testPattern)) {
                                List<SubjectiveTestSubmit> submissions2 = lmsDaoInterf.findSubjectiveTestByTestIdAndStudentIdAndQuestionId(
                                        testId, studentId, question.getQuestionId());

                                // Map each answer to a TestAnswerResponse
                                answerResponses = submissions2.stream().map(answer -> new TestAnswerResponse(null, answer.getSubmittedAnswer(), Boolean.TRUE, Boolean.TRUE)).toList();
                            }

                            // return the response for the current question
                            return new TestQuestionResponse(question.getQuestionId(), question.getQuestion(), question.getQuestionMark(), answerResponses);
                        }).toList();

                        // Prepare the response map with the "attemptResponse" key
                        HashMap<String, Object> attemptResponse = new HashMap<>();
                        attemptResponse.put("testId", testDB.getTestId());
                        attemptResponse.put("testName", testDB.getTestName());
                        attemptResponse.put("questions", questionResponses);

                        // return the final response for the test
                        responseMap.put("attemptResponse", attemptResponse);
                        responseMap.put("status", Boolean.TRUE);

                        return ResponseEntity.ok(responseMap);
                    }

                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Test not found");
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Test attempts not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);

            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Student id or test pattern incorrect");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // service layer for adding announcements to a batch
    @Override
    @Transactional
    public ResponseEntity<Map<String, Object>> addAnnouncementToBatch(BatchDB announcementEntity) {
        HashMap<String, Object> responseMap = new HashMap<>();
        try {
            // Check if batchId is not null
            if (!Objects.isNull(announcementEntity.getBatchId()) && !Objects.isNull(announcementEntity.getAnnouncementEntityDB()) && !announcementEntity.getAnnouncementEntityDB().isEmpty()) {
                // Fetch the batch using the batchId
                Optional<BatchDB> optionalPresentBatch = lmsDaoInterf.findBatchById(announcementEntity.getBatchId());

                // Check if the batch is present
                if (optionalPresentBatch.isPresent()) {
                    // Create a new AnnouncementEntity
                    AnnouncementEntity newAnnouncementEntity = new AnnouncementEntity();
                    newAnnouncementEntity.setAnnouncementTitle(announcementEntity.getAnnouncementEntityDB().getFirst().getAnnouncementTitle());
                    newAnnouncementEntity.setAnnouncementMessage(announcementEntity.getAnnouncementEntityDB().getFirst().getAnnouncementMessage());
                    newAnnouncementEntity.setIsActive(Boolean.TRUE);
                    newAnnouncementEntity.setBatchDB(optionalPresentBatch.get());

                    // Fetch user information based on the username provided in the announcement entity
                    Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(announcementEntity.getAnnouncementEntityDB().getFirst().getUserName());
                    Long actorUserId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

                    if (userInfo.isPresent()) {
                        newAnnouncementEntity.setCreatedBy(actorUserId);
                        newAnnouncementEntity.setAnnouncementById(actorUserId);
                        newAnnouncementEntity.setAnnouncementByName(userInfo.get().getFullName());
                    }

                    // Persist the new announcement
                    AnnouncementEntity addAnnouncement = lmsDaoInterf.persistAnnouncementMaster(newAnnouncementEntity);

                    // Check if the announcement was successfully persisted
                    if (!Objects.isNull(addAnnouncement.getAnnouncementId())) {
                        boolean isReadSave = syncAnnouncementReadRecipients(addAnnouncement, optionalPresentBatch.get(), actorUserId, false);

                        if (isReadSave) {
                            responseMap.put("status", Boolean.TRUE);
                            responseMap.put("message", "announcement added successfully");
                            return ResponseEntity.ok(responseMap);
                        }

                        responseMap.put("status", Boolean.FALSE);
                        responseMap.put("message", "Announcement created, but failed to sync recipients");
                        return ResponseEntity.internalServerError().body(responseMap);
                    }

                    // Return failure response if announcement creation failed
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Failed to create announcement");
	                
                } else {
                    // Return failure response if batch is not found
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Batch not found");
                }
            } else {
                // Return failure response if batchId is null
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "BatchId and announcement payload are required");
            }
	        return ResponseEntity.unprocessableEntity().body(responseMap);
        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // service layer to fetch all announcements batch wise
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchAllAnnouncements(Long branchId) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            List<Map<String, Object>> announcementList = lmsDaoInterf.fetchAllAnnouncements(branchId)
                    .orElseGet(Collections::emptyList)
                    .stream()
                    .map(this::mapAnnouncementResponse)
                    .toList();

            responseMap.put("data", announcementList);
            responseMap.put("status", Boolean.TRUE);
            responseMap.put("message", announcementList.isEmpty() ? "No announcements found" : "Announcements fetched successfully");
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            // Log the exception
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // service layer for editing announcements
    @Override
    @Transactional
    public ResponseEntity<Map<String, Object>> editAnnouncementToBatch(BatchDB announcementEntity) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Check if batchId and announcementEntityDB are present and not empty
            if (announcementEntity.getBatchId() != null && !Objects.isNull(announcementEntity.getAnnouncementEntityDB()) && !announcementEntity.getAnnouncementEntityDB().isEmpty()) {

                // Fetch the existing announcement by announcementId
                Optional<AnnouncementEntity> optionalAnnouncement = lmsDaoInterf.findActiveAnnouncementById(announcementEntity.getAnnouncementEntityDB().getFirst().getAnnouncementId());

                // Check if the announcement is present
                if (optionalAnnouncement.isPresent()) {
                    AnnouncementEntity existingAnnouncement = optionalAnnouncement.get();

                    // Update the announcement title and message
                    existingAnnouncement.setAnnouncementTitle(announcementEntity.getAnnouncementEntityDB().getFirst().getAnnouncementTitle());
                    existingAnnouncement.setAnnouncementMessage(announcementEntity.getAnnouncementEntityDB().getFirst().getAnnouncementMessage());
                    existingAnnouncement.setIsActive(announcementEntity.getAnnouncementEntityDB().getFirst().getIsActive());

                    // Fetch user information based on the username provided in the announcement entity
                    Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(announcementEntity.getAnnouncementEntityDB().getFirst().getUserName());
                    Long actorUserId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

                    if (userInfo.isPresent()) {
                        existingAnnouncement.setUpdatedBy(actorUserId);
                        existingAnnouncement.setAnnouncementById(actorUserId);
                        existingAnnouncement.setAnnouncementByName(userInfo.get().getFullName());
                    }

                    // Persist the updated announcement
                    AnnouncementEntity updatedAnnouncement = lmsDaoInterf.persistAnnouncementMaster(existingAnnouncement);

                    // Check if the announcement was successfully updated
                    if (!Objects.isNull(updatedAnnouncement.getAnnouncementId())) {
                        if (Boolean.TRUE.equals(updatedAnnouncement.getIsActive())) {
                            boolean isReadSaved = syncAnnouncementReadRecipients(
                                    updatedAnnouncement,
                                    existingAnnouncement.getBatchDB(),
                                    actorUserId,
                                    true
                            );

                            if (!isReadSaved) {
                                responseMap.put("status", Boolean.FALSE);
                                responseMap.put("message", "Announcement updated, but failed to refresh recipients");
                                return ResponseEntity.internalServerError().body(responseMap);
                            }
                        }

                        // Return success response
                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("message", "announcement updated successfully");
                        return ResponseEntity.ok(responseMap);
                    }

                    // Return failure response if announcement update failed
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Failed to update announcement");
	                
                } else {
                    // Return failure response if announcement is not found
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Announcement not found");
                }
	            return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            // Return failure response if batchId or announcementEntityDB is not present
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "BatchId or Announcement Object not present");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // service layer for fetching announcements for student and read status
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchAnnouncementStudentWise(String userName, Boolean markAsRead) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Extract user id from the user information if present
            Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            // Initialize a list to hold the announcements
            LinkedList<Map<String, Object>> announcementList = new LinkedList<>();

            // Check if the user id is not null
            if (!Objects.isNull(userId)) {

                // Calculate the date 15 days before the current date
                LocalDateTime startDate = LocalDateTime.now().minusDays(15);

                // Fetch announcement read statuses based on user id and markAsRead status
                Optional<List<AnnouncementReadEntity>> announcementStatus = lmsDaoInterf.fetchAnnouncementReadByStudentIdAndStatus(userId, markAsRead, startDate);
                
                Set<Long> seenAnnouncementIds = new HashSet<>();

                // Check if the fetched announcement statuses are present and not empty
                if (announcementStatus.isPresent() && !announcementStatus.get().isEmpty()) {
                    List<AnnouncementReadEntity> announcementReadEntityList = announcementStatus.get();

                    // For each announcement read status, fetch the corresponding announcement
                    announcementReadEntityList.forEach(announcementsDBS -> {
                        Optional<AnnouncementEntity> announcements = lmsDaoInterf.findActiveAnnouncementById(announcementsDBS.getAnnouncementId());
                        announcements.ifPresent(a -> {
                            seenAnnouncementIds.add(a.getAnnouncementId());
                            announcementList.add(mapAnnouncementResponse(a));
                        });
                    });
                }
                
                // Fetch branch-wide announcements to ensure branch visibility
                Long branchId = userInfo.map(UserInfoDB::getOrganizationsDB).map(OrganizationsDB::getOrgId).orElse(null);
                if (branchId != null) {
                    Optional<List<AnnouncementEntity>> branchAnnouncements = lmsDaoInterf.fetchAllAnnouncements(branchId);
                    branchAnnouncements.ifPresent(list -> {
                        list.forEach(a -> {
                            if (!seenAnnouncementIds.contains(a.getAnnouncementId())) {
                                seenAnnouncementIds.add(a.getAnnouncementId());
                                announcementList.add(mapAnnouncementResponse(a));
                            }
                        });
                    });
                }
                
                // Sort announcements recent first
                announcementList.sort((m1, m2) -> {
                    LocalDateTime t1 = (LocalDateTime) m1.get("creationTimeStamp");
                    LocalDateTime t2 = (LocalDateTime) m2.get("creationTimeStamp");
                    if (t1 == null && t2 == null) return 0;
                    if (t1 == null) return 1;
                    if (t2 == null) return -1;
                    return t2.compareTo(t1);
                });

                // If announcements are found, add them to the response map and return success response
                if (!announcementList.isEmpty()) {
                    responseMap.put("data", announcementList);
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("data", announcementList);
                responseMap.put("status", Boolean.TRUE);
                responseMap.put("message", "No announcements found");
                return ResponseEntity.ok(responseMap);
            }

            // If user id is null, return an unprocessable entity response with appropriate message
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "UserName not valid or user not found");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // service layer to markAsRead for Announcements
    @Override
    @Transactional
    public ResponseEntity<Map<String, Object>> markAnnouncementsAsRead(String userName, List<Long> announcementIds) {
        // Initialize response map to store the response data
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(userName);

            // Extract user id from the user information if present
            Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            // Check if the user id is not null
            if (!Objects.isNull(userId)) {

                // Calculate the date 15 days before the current date
                LocalDateTime startDate = LocalDateTime.now().minusDays(15);

                // Fetch unread announcements for the student
                Optional<List<AnnouncementReadEntity>> unReadAnnouncements = lmsDaoInterf.fetchAnnouncementReadByStudentIdAndStatus(userId, Boolean.FALSE, startDate);

                // Check if there are any unread announcements present
                if (unReadAnnouncements.isPresent() && !unReadAnnouncements.get().isEmpty()) {
                    // Iterate through each unread announcement
                    unReadAnnouncements.get().forEach(announcementReadEntity -> {
                        // If the announcement ID is in the list, mark it as read
                        if (announcementIds.contains(announcementReadEntity.getAnnouncementId())) {
                            announcementReadEntity.setMarkAsRead(Boolean.TRUE);
                            lmsDaoInterf.persistAnnouncementRead(announcementReadEntity);
                        }
                    });

                    // Return a success response
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "Announcements marked as read");
                    return ResponseEntity.ok(responseMap);
                }

                // If no unread announcements are found, return an unprocessable entity response with appropriate message
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Announcements not found for the user");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            // If user id is null, return an unprocessable entity response with appropriate message
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "UserName not valid or user not found");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // service layer to add or update holiday master
    @Override
    public ResponseEntity<Map<String, Object>> saveOrUpdateHolidayMaster(HolidayMaster holidayMaster) {
        // Initialize response map to store the response data
        HashMap<String, Object> responseMap = new HashMap<>();
        try {

            // Fetch user information based on the provided username
            Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(holidayMaster.getUserName());

            // Extract studentId from the user information if present
            Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

            LinkedList<HolidayMaster> holidayMasterList = new LinkedList<>();

            if(!Objects.isNull(userId)) {
                OrganizationsDB resolvedBranch = Optional.ofNullable(holidayMaster.getOrganizationsDB())
                        .map(OrganizationsDB::getOrgId)
                    .flatMap(lmsDaoInterf::findOrganizationsById)
                        .orElseGet(() -> userInfo.map(UserInfoDB::getOrganizationsDB).orElse(null));

                if (Objects.isNull(resolvedBranch)) {
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Branch not found for holiday");
                    return ResponseEntity.badRequest().body(responseMap);
                }

                if (!Objects.isNull(holidayMaster.getHolidayId())) {

                    Optional<HolidayMaster> presentHoliday = lmsDaoInterf.fetchHolidayMasterById(holidayMaster.getHolidayId());

                    if (presentHoliday.isPresent()) {
                        presentHoliday.get().setHolidayName(holidayMaster.getHolidayName());
                        presentHoliday.get().setHolidayFromDate(holidayMaster.getHolidayFromDate());
                        presentHoliday.get().setHolidayToDate(holidayMaster.getHolidayToDate());
                        presentHoliday.get().setHolidayType(holidayMaster.getHolidayType());
                        presentHoliday.get().setIsActive(holidayMaster.getIsActive());
                        presentHoliday.get().setOrganizationsDB(resolvedBranch);

                        presentHoliday.get().setUpdatedBy(userId);

                        holidayMasterList.add(presentHoliday.get());
                        responseMap.put("message", "Holiday updated");
                    } else {

                        responseMap.put("status", Boolean.FALSE);
                        responseMap.put("message", "holidayId not found");
                        return ResponseEntity.unprocessableEntity().body(responseMap);
                    }
                } else {

                    HolidayMaster newHoliday = new HolidayMaster();
                    newHoliday.setHolidayName(holidayMaster.getHolidayName());
                    newHoliday.setHolidayFromDate(holidayMaster.getHolidayFromDate());
                    newHoliday.setHolidayToDate(holidayMaster.getHolidayToDate());
                    newHoliday.setIsActive(Boolean.TRUE);
                    newHoliday.setHolidayType(holidayMaster.getHolidayType());
                    newHoliday.setOrganizationsDB(resolvedBranch);

                    newHoliday.setCreatedBy(userId);

                    holidayMasterList.add(newHoliday);
                    responseMap.put("message", "Holiday added");
                }
            } else {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "User not found for holiday save");
                return ResponseEntity.badRequest().body(responseMap);
            }

            List<HolidayMaster> postList = lmsDaoInterf.saveHolidayMaster(holidayMasterList);

            if (!postList.isEmpty() && !Objects.isNull(postList.getFirst().getHolidayId())) {
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "holiday not added");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> fetchAllHolidays(Long branchId) {
        // Initialize response map to store the response data
        HashMap<String, Object> responseMap = new HashMap<>();
        try {

            List<HolidayMaster> holidayMasterList = lmsDaoInterf.fetchAllHolidays(branchId);

            if (!holidayMasterList.isEmpty()) {

                responseMap.put("data", holidayMasterList);
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            }
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "No holidays found");
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getMonthlyAdminSchedules(Integer year, Integer month, Long branchId) {
        HashMap<String, Object> responseMap = new HashMap<>();
        try {
            Map<String, List<Map<String, Object>>> schedulesByDate = new HashMap<>();

            // Add Holidays
            List<HolidayMaster> holidays = lmsDaoInterf.fetchAllHolidays(branchId);
            if (holidays != null) {
                for (HolidayMaster holiday : holidays) {
                    if (holiday.getHolidayFromDate() != null && holiday.getHolidayToDate() != null && Boolean.TRUE.equals(holiday.getIsActive())) {
                        LocalDate currentDate = holiday.getHolidayFromDate();
                        while (!currentDate.isAfter(holiday.getHolidayToDate())) {
                            if (currentDate.getYear() == year && currentDate.getMonthValue() == month) {
                                String dateStr = currentDate.toString();
                                Map<String, Object> event = new HashMap<>();
                                event.put("type", "Holiday");
                                event.put("title", holiday.getHolidayName());
                                event.put("description", "Holiday");
                                schedulesByDate.computeIfAbsent(dateStr, k -> new ArrayList<>()).add(event);
                            }
                            currentDate = currentDate.plusDays(1);
                        }
                    }
                }
            }

            responseMap.put("status", true);
            responseMap.put("schedules", schedulesByDate);
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            responseMap.put("status", false);
            responseMap.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }
    @Override
    public ResponseEntity<Map<String, Object>> addCourseToBatch(BatchCourseRelationEntity batchCourseRelationEntity) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            // Get Already Present Batch
            BatchDB batchDB = lmsDaoInterf.findBatchById(batchCourseRelationEntity.getBatchId()).orElse(null);

            // Get Already Present Course
            LibraryMasterDB course = lmsDaoInterf.fetchActiveLibraryMasterById(batchCourseRelationEntity.getCourseId()).orElse(null);

            // Get Tutor
            UserInfoDB tutor = lmsDaoInterf.getUserInfoById(batchCourseRelationEntity.getTutorId()).orElse(null);

            if (!Objects.isNull(batchDB) && !Objects.isNull(course) && !Objects.isNull(tutor)) {

                BatchCourseRelationEntity batchCourseRelation = new BatchCourseRelationEntity();

                batchCourseRelation.setCourseId(course.getMaterialId());
                batchCourseRelation.setTutorId(tutor.getUserDetailsId());
                batchCourseRelation.setBatchId(batchDB.getBatchId());
                batchCourseRelation.setIsDefault(batchCourseRelationEntity.getIsDefault());
                batchCourseRelation.setIsActive(Boolean.TRUE);

                if (lmsDaoInterf.saveBatchCourseRelation(batchCourseRelation)) {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message_course_enrollment_in_batch", "COURSE_ADDED");

                    // Get enrolled students in that batch
                    List<BatchStudentEnrollmentsDB> studentBatchEnrollments = lmsDaoInterf.findStudentsEnrolledInABatch(batchCourseRelationEntity.getBatchId()).orElse(Collections.emptyList());

                    if (!studentBatchEnrollments.isEmpty()){

                        LinkedList<MaterialEnrollmentDB> courseEnrollments = new LinkedList<>();

                        studentBatchEnrollments.forEach(batchStudentEnrollmentsDB -> {
                            lmsDaoInterf.getUserInfoById(batchStudentEnrollmentsDB.getStudentId()).ifPresent(
                                    userInfoDB -> {
                                        String studentUserName = userInfoDB.getEmail();
                                        if (studentUserName == null || studentUserName.isBlank()) {
                                            return;
                                        }

                                        boolean alreadyEnrolled = lmsDaoInterf.fetchEnrollmentStatus(batchCourseRelation.getCourseId(), studentUserName)
                                                .isPresent();

                                        if (!alreadyEnrolled) {
                                            courseEnrollments.add(buildCourseEnrollment(studentUserName, course, tutor.getFullName()));
                                        }
                                    }
                            );
                        });

                        Boolean enrolledInCourses = courseEnrollments.isEmpty() || lmsDaoInterf.saveAllMaterialEnrollments(courseEnrollments);

                        if(enrolledInCourses)
                            responseMap.put("message_student_enrollment_in_course", "COURSE_ENROLLMENT_DONE");
                        else
                            responseMap.put("message_student_enrollment_in_course", "COURSE_ENROLLMENT_FAILED");
                    }else{
                        responseMap.put("message_student_enrollment_in_course", "NO_STUDENT_ENROLLED_IN_BATCH");
                    }

                } else {
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.internalServerError().body(responseMap);
                }

                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.badRequest().body(responseMap);
            }

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);

        }
    }

    private MaterialEnrollmentDB buildCourseEnrollment(String userName, LibraryMasterDB course, String tutorName) {
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
                .map(chapter -> buildEnrolledChapter(userName, enrollmentDB, chapter))
                .toList();

        enrollmentDB.setEnrolledChaptersDBList(enrolledChapters);
        return enrollmentDB;
    }

    private EnrolledChaptersDB buildEnrolledChapter(String userName,
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


    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<RolesDB>> getTutorMaster() {
        try {
            return lmsDaoInterf.fetchAllTeacherList().filter(allTeacher -> !allTeacher.isEmpty()).map(teachers -> {
                
                // Transform RolesDB to safe format by creating new instances without proxy issues
                List<RolesDB> result = new ArrayList<>();
                
                for (RolesDB teacher : teachers) {
                    RolesDB cleanRole = new RolesDB();
                    cleanRole.setRolesId(teacher.getRolesId());
                    cleanRole.setRoleMaster(teacher.getRoleMaster());
                    
                    // Create a new HashSet with only essential user info to avoid proxy serialization issues
                    Set<UserInfoDB> cleanUserInfo = new HashSet<>();
                    Set<UserInfoDB> originalUserInfo = teacher.getUserInfo();
                    
                    if (originalUserInfo != null) {
                        for (UserInfoDB userInfo : originalUserInfo) {
                            UserInfoDB cleanUser = new UserInfoDB();
                            cleanUser.setUserDetailsId(userInfo.getUserDetailsId());
                            cleanUser.setFullName(userInfo.getFullName());
                            cleanUser.setEmail(userInfo.getEmail());
                            cleanUser.setGender(userInfo.getGender());
                            cleanUser.setMobileNo(userInfo.getMobileNo());
                            cleanUser.setIsActive(userInfo.getIsActive());
                            
                            // Don't copy sensitive fields like userImage (LOB) and userCredentials
                            cleanUserInfo.add(cleanUser);
                        }
                    }
                    
                    cleanRole.setUserInfo(cleanUserInfo);
                    // Don't copy privileges to avoid additional serialization issues
                    cleanRole.setPrivileges(new ArrayList<>());
                    
                    result.add(cleanRole);
                }
                
                return ResponseEntity.ok(result);
            }).orElseGet(() -> ResponseEntity.unprocessableEntity().body(Collections.emptyList()));
        } catch (Exception e) {
            logger.error("Error in getTutorMaster: ", e);
            return ResponseEntity.internalServerError().body(Collections.emptyList());
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchCoursesOfBatch(Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            List<BatchCourseRelationEntity> batchCourseRelationEntityList = lmsDaoInterf.fetchBatchCourses(batchId).orElse(Collections.emptyList());

            if (!batchCourseRelationEntityList.isEmpty()) {
                LinkedList<LibraryMasterDB> courseList = new LinkedList<>();

                batchCourseRelationEntityList.forEach(batchCourseRelationEntity -> {

                    LibraryMasterDB course = lmsDaoInterf.fetchActiveLibraryMasterById(batchCourseRelationEntity.getCourseId()).orElse(null);
                    if (!Objects.isNull(course)) {
                        course.setMaterialDescDB(null);
                        course.setTestDB(null);
                        course.setChaptersDBList(null);

                        UserInfoDB user = lmsDaoInterf.getUserInfoById(batchCourseRelationEntity.getTutorId()).orElse(null);

                        BatchDB enrollments = lmsDaoInterf.findBatchById(batchId).orElse(null);

                        if (!Objects.isNull(user)) {
                            course.setIsDefault(batchCourseRelationEntity.getIsDefault());
                            course.setAssignedTeacherId(user.getUserDetailsId());
                            course.setAssignedTeacher(user.getFullName());
                        }
                        if (!Objects.isNull(enrollments) && enrollments.getIsActive())
                            course.setTotalEnrolledStudents(enrollments.getBatchStudentEnrollmentsDB().size());
                        courseList.add(course);
                    }

                });

                responseMap.put("courses", courseList);
            } else {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "NO_COURSES_ADDED_YET");
            }

            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());


            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> saveNewTestMaster(TestDB testInput) {

        HashMap<String, Object> responseMap = new HashMap<>();
        Boolean isBatchTestRelationSaved = Boolean.FALSE;
        AtomicReference<Boolean> isTestStudentRelationSaved = new AtomicReference<>(Boolean.FALSE);

        List<Long> testIdsList;
        try {
            if (!Objects.isNull(testInput.getBatchId()) && !Objects.isNull(testInput.getMaterialId())) {

                Optional<LibraryMasterDB> presentLibraryMaster = lmsDaoInterf.fetchActiveLibraryMasterById(testInput.getMaterialId());

                if (presentLibraryMaster.isPresent()) {

                    // Fetch user information based on the provided username
                    Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(testInput.getUserName());

                    // Extract studentId from the user information if present
                    Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

                    List<BatchTestRelationEntity> alreadyAvailableTests = lmsDaoInterf.fetchBatchTests(testInput.getBatchId(), TestType.LIVE_TEST).orElse(Collections.emptyList());

                    // Create a list of existing testIds
                    testIdsList = alreadyAvailableTests.stream()
                            .map(BatchTestRelationEntity::getTestId)
                            .toList();

                    // Check for overlapping or matching test time intervals
                    if (!testIdsList.isEmpty()) {

                        List<TestDB> overlappingTests = lmsDaoInterf.findOverlappingTests(testIdsList, testInput.getTestStartDate(), testInput.getTestEndDate());

                        if (!overlappingTests.isEmpty()) {
                            responseMap.put("status", Boolean.FALSE);
                            responseMap.put("message", "TEST TIME OVERLAPS WITH AN EXISTING TEST IN THE BATCH");
                            return ResponseEntity.status(409).body(responseMap);
                        }
                    }

                    TestDB newTestDB = new TestDB();

                    // setting test details
                    newTestDB.setTestName(testInput.getTestName());
                    newTestDB.setDescription(testInput.getDescription());
                    newTestDB.setTotalQuestions(testInput.getTotalQuestions());
                    newTestDB.setTotalMarks(testInput.getTotalMarks());
                    newTestDB.setIsPublished(Boolean.FALSE);
                    newTestDB.setIsDraft(Boolean.FALSE);
                    if(Objects.equals(testInput.getTestPattern(), TestPattern.OBJECTIVE)){
                        newTestDB.setTestPattern(TestPattern.OBJECTIVE);
                    }
                    else {
                        newTestDB.setTestPattern(TestPattern.SUBJECTIVE);
                    }
                    newTestDB.setIsActive(Boolean.TRUE);

                    if (Objects.equals(testInput.getTestType(), TestType.LIVE_TEST)) {
                        newTestDB.setTestStartDate(testInput.getTestStartDate());
                        newTestDB.setTestEndDate(testInput.getTestEndDate());
                        newTestDB.setTestType(TestType.LIVE_TEST);
                    } else {
                        newTestDB.setTestType(TestType.MOCK_TEST);
                    }

                    newTestDB.setCreatedBy(userId);

                    newTestDB.setLibraryMasterDB(presentLibraryMaster.get());

                    TestDB savedTest = lmsDaoInterf.saveTestMaster(newTestDB);

                    if (!Objects.isNull(savedTest.getTestId())) {

                        BatchTestRelationEntity newRelation = new BatchTestRelationEntity();
                        newRelation.setBatchId(testInput.getBatchId());
                        newRelation.setTestId(savedTest.getTestId());
                        newRelation.setCourseId(testInput.getMaterialId());
                        if (Objects.equals(testInput.getTestType(), TestType.LIVE_TEST)) {
                            newRelation.setTestType(TestType.LIVE_TEST);
                        } else {
                            newRelation.setTestType(TestType.MOCK_TEST);
                        }
                        newRelation.setIsActive(Boolean.TRUE);

                        newRelation.setCreatedBy(userId);

                        isBatchTestRelationSaved = lmsDaoInterf.saveBatchTestRelation(newRelation);

                        Optional<BatchDB> optionalPresentBatch = lmsDaoInterf.findBatchById(testInput.getBatchId());

                        if(optionalPresentBatch.isPresent()) {
                            // Fetch the list of student enrollments in the batch
                            List <BatchStudentEnrollmentsDB> presentEnrollments = optionalPresentBatch.get().getBatchStudentEnrollmentsDB().stream().filter(BatchStudentEnrollmentsDB::getIsActive).toList();
                            
                            // Check if there are any student enrollments
                            if (!presentEnrollments.isEmpty()) {
                                
                                presentEnrollments.forEach(enrollment -> {
                                    
                                    TestStudentRelation newTestStudentRelation = new TestStudentRelation();
                                    newTestStudentRelation.setTestId(savedTest.getTestId());
                                    newTestStudentRelation.setIsTestAttempted(Boolean.FALSE);
                                    newTestStudentRelation.setStudentId(enrollment.getStudentId());
                                    
                                    isTestStudentRelationSaved.set(lmsDaoInterf.persistTestStudentRelation(newTestStudentRelation));
                                });
                            }
                        }
                    }


                    if (isBatchTestRelationSaved && isTestStudentRelationSaved.get()) {
                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("message", "Test and batchTestRelation saved");
                        responseMap.put("testData", savedTest);
                        return ResponseEntity.ok(responseMap);
                    } else if(isBatchTestRelationSaved){
                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("message", "batchTestRelation saved");
                        responseMap.put("testData", savedTest);
                        return ResponseEntity.ok(responseMap);
                    }

                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Batch test relation not saved");
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Course not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Batch id and material id/course id is mandatory");
            return ResponseEntity.unprocessableEntity().body(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> updateTest(TestDB testInput) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            if (!Objects.isNull(testInput.getTestId())) {

                Optional<TestDB> optionalPresentTest = lmsDaoInterf.findTestById(testInput.getTestId());

                if (optionalPresentTest.isPresent()) {

                    // Fetch user information based on the provided username
                    Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(testInput.getUserName());

                    // Extract studentId from the user information if present
                    Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

                    TestDB presentTest = optionalPresentTest.get();

                    presentTest.setTestName(testInput.getTestName());
                    presentTest.setDescription(testInput.getDescription());
                    presentTest.setTotalQuestions(testInput.getTotalQuestions());
                    presentTest.setTotalMarks(testInput.getTotalMarks());
                    presentTest.setIsPublished(testInput.getIsPublished());
                    presentTest.setIsDraft(testInput.getIsDraft());
                    if(Objects.equals(testInput.getTestPattern(), TestPattern.OBJECTIVE)){
                        presentTest.setTestPattern(TestPattern.OBJECTIVE);
                    }
                    else {
                        presentTest.setTestPattern(TestPattern.SUBJECTIVE);
                    }
                    presentTest.setIsActive(Boolean.TRUE);
                    if (Objects.equals(testInput.getTestType(), TestType.LIVE_TEST)) {

                        presentTest.setTestStartDate(testInput.getTestStartDate());
                        presentTest.setTestEndDate(testInput.getTestEndDate());
                        presentTest.setTestType(TestType.LIVE_TEST);
                    } else {
                        presentTest.setTestType(TestType.MOCK_TEST);
                    }

                    presentTest.setUpdatedBy(userId);

                    if(!Objects.isNull(testInput.getTestQuestionsDB()) && !testInput.getTestQuestionsDB().isEmpty()) {

                        // extracting questions from JSON input
                        List<TestQuestionsDB> testQuestionList = testInput.getTestQuestionsDB();
                        // extracting question from DB
                        List<TestQuestionsDB> testQuestionsDB = presentTest.getTestQuestionsDB();


                        // using for-each questionInputs
                        testQuestionList.forEach(testQuestionsInput -> {

                            // fetching questions present in DB using questionId
                            Optional<TestQuestionsDB> optionalPresentQuestion = testQuestionsDB.stream()
                                    .filter(questions -> !Objects.isNull(testQuestionsInput.getQuestionId()) && Objects.equals(questions.getQuestionId(), testQuestionsInput.getQuestionId()))
                                    .findFirst();

                            // checking if question present
                            if (optionalPresentQuestion.isPresent()) {

                                // extracting present questions
                                TestQuestionsDB presentQuestion = optionalPresentQuestion.get();

                                // extracting index
                                int questionIndex = testQuestionsDB.indexOf(presentQuestion);

                                // setting question details
                                presentQuestion.setQuestion(testQuestionsInput.getQuestion());
                                presentQuestion.setQuestionType(testQuestionsInput.getQuestionType());
                                presentQuestion.setQuestionMark(testQuestionsInput.getQuestionMark());

                                // extracting answers from JSON input
                                List<TestAnswersDB> testAnswersList = testQuestionsInput.getTestAnswersDB();
                                // extracting answers from DB
                                List<TestAnswersDB> testAnswersDB = presentQuestion.getTestAnswersDB();

                                // using for-each for answerInput
                                testAnswersList.forEach(testAnswerInput -> {

                                    // fetching answers present in DB using answerId
                                    Optional<TestAnswersDB> optionalPresentAnswer = testAnswersDB.stream()
                                            .filter(answers -> Objects.equals(answers.getAnswerId(), testAnswerInput.getAnswerId()))
                                            .findFirst();

                                    // checking if answer present
                                    if (optionalPresentAnswer.isPresent()) {

                                        // extracting present answer
                                        TestAnswersDB presentAnswer = optionalPresentAnswer.get();

                                        // extracting index
                                        int answerIndex = testAnswersDB.indexOf(presentAnswer);

                                        // setting answer details
                                        presentAnswer.setAnswer(testAnswerInput.getAnswer());

                                        // updating an object in a list
                                        testAnswersDB.set(answerIndex, presentAnswer);
                                    }
                                    // creating new answer
                                    else {
                                        TestAnswersDB newAnswerDB = new TestAnswersDB();

                                        // setting answer details
                                        newAnswerDB.setAnswer(testAnswerInput.getAnswer());


                                        // setting reference of present question to answer
                                        newAnswerDB.setTestQuestionsDB(presentQuestion);

                                        // updating an object in a list
                                        testAnswersDB.add(newAnswerDB);

                                        // checking if correctOption
                                        if (testAnswerInput.getCorrectOption()) {
                                            CorrectAnswerDB correctAnswerDB = new CorrectAnswerDB();

                                            // setting correct answer reference
                                            correctAnswerDB.setTestAnswersDB(newAnswerDB);
                                            correctAnswerDB.setTestQuestionsDB(presentQuestion);

                                            // setting reference of correctAnswer to presentQuestion
                                            presentQuestion.setCorrectAnswerDB(correctAnswerDB);
                                        }
                                    }
                                });

                                // setting reference of answersDB to presentquestions
                                presentQuestion.setTestAnswersDB(testAnswersDB);

                                // updating an object in a list
                                testQuestionsDB.set(questionIndex, presentQuestion);
                            }
                            // create new question
                            else {

                                TestQuestionsDB newQuestionsDB = new TestQuestionsDB();

                                // setting question details
                                newQuestionsDB.setQuestion(testQuestionsInput.getQuestion());
                                newQuestionsDB.setQuestionType(testQuestionsInput.getQuestionType());
                                newQuestionsDB.setQuestionMark(testQuestionsInput.getQuestionMark());

                                // setting reference of questionDB to present tests
                                newQuestionsDB.setTestDB(presentTest);

                                // extracting answers
                                List<TestAnswersDB> testAnswersList = testQuestionsInput.getTestAnswersDB();
                                LinkedList<TestAnswersDB> testAnswerList = new LinkedList<>();

                                // checking if answer present
                                if (testAnswersList != null) {
                                    testAnswersList.forEach(testAnswerEntity -> {

                                        TestAnswersDB newAnswerDB = new TestAnswersDB();

                                        // setting answer details
                                        newAnswerDB.setAnswer(testAnswerEntity.getAnswer());

                                        // setting reference of questionDB to answerDB
                                        newAnswerDB.setTestQuestionsDB(newQuestionsDB);

                                        // updating an object in a list
                                        testAnswerList.add(newAnswerDB);

                                        // checking if correctOption
                                        if (testAnswerEntity.getCorrectOption()) {
                                            CorrectAnswerDB correctAnswerDB = new CorrectAnswerDB();

                                            // setting correct answer reference
                                            correctAnswerDB.setTestAnswersDB(newAnswerDB);
                                            correctAnswerDB.setTestQuestionsDB(newQuestionsDB);

                                            // setting reference of correctAnswer to newQuestion
                                            newQuestionsDB.setCorrectAnswerDB(correctAnswerDB);
                                        }
                                    });

                                    // setting reference of answerDB to questionDB
                                    newQuestionsDB.setTestAnswersDB(testAnswerList);
                                }
                                // updating an object in a list
                                testQuestionsDB.add(newQuestionsDB);
                            }
                        });

                        // setting reference of questions to presentTest
                        presentTest.setTestQuestionsDB(testQuestionsDB);

                    }

                    TestDB savedTest = lmsDaoInterf.saveTestMaster(presentTest);

                    if (!Objects.isNull(savedTest.getTestId())) {

                        responseMap.put("status", Boolean.TRUE);
                        responseMap.put("message", "test updated successfully");
                        return ResponseEntity.ok(responseMap);
                    }

                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "test not updated");
                    return ResponseEntity.unprocessableEntity().body(responseMap);


                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Test not found or incorrect test id");
                return ResponseEntity.unprocessableEntity().body(responseMap);

            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Test id is mandatory");
            return ResponseEntity.unprocessableEntity().body(responseMap);
        } catch (Exception e) {

            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }
    
    @Override
    public ResponseEntity<Map<String, Object>> saveTestXsl(Long testId, List<TestQuestionsDB> questionsDBS)
    {
        HashMap<String, Object> responseMap = new HashMap<>();
        try
        {
            //extracting an object using testId
            Optional<TestDB> existingTest = lmsDaoInterf.findTestById(testId);
            
            //checking if an object is present or not
            if(existingTest.isPresent())
            {
                //checking if an object is null or empty or not
                if(!Objects.isNull(questionsDBS) && !questionsDBS.isEmpty())
                {
                    //extracting list of TestQuestionsDB object from existingTest
                    List<TestQuestionsDB> existingQuestion = existingTest.get().getTestQuestionsDB();
                    
                    //using for each to iterate over a list
                    questionsDBS.forEach(questionTest -> {
                        
                        //setting reference
                        questionTest.setTestDB(existingTest.get());
                        
                        //adding an object in a existingQuestion object
                        existingQuestion.add(questionTest);
                        
                    });
                    
                    //setting the list
                    existingTest.get().setTestQuestionsDB(existingQuestion);
                }
                
                //saving object
                TestDB testDB = lmsDaoInterf.saveTestMaster(existingTest.get());
                
                if(!Objects.isNull(testDB))
                {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "test updated successfully");
                    return ResponseEntity.ok(responseMap);
                }
                
                else
                {
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "test updated unsuccessfully");
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }
            }
            else
            {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Test id is mandatory");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }
            
        }
        
        catch(Exception e)
        {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }
    

    @Override
    public ResponseEntity<Map<String, Object>> fetchBatchEnrolledStudent(Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        LinkedList<UserInfoDB> usersList = new LinkedList<>();

        List<BatchStudentEnrollmentsDB> enrollments;

        try {
            BatchDB batch = lmsDaoInterf.findBatchById(batchId).orElse(null);

            if (!Objects.isNull(batch)) {
                enrollments = batch.getBatchStudentEnrollmentsDB().stream().filter(BatchStudentEnrollmentsDB::getIsActive).toList();

                if (!enrollments.isEmpty()) {
                    enrollments.forEach(batchStudentEnrollmentsDB -> {

                        UserInfoDB user = lmsDaoInterf.getUserInfoById(batchStudentEnrollmentsDB.getStudentId()).orElse(null);

                        if (!Objects.isNull(user)) {
                            user.setRoles(null);
                            user.setUserCredentialsDB(null);
                            user.setOrganizationsDB(null);

                            Integer enrollmentsCount = lmsDaoInterf.fetchEnrolledCoursesCountOfStudent(user.getEmail());

                            user.setCoursesEnrolled(enrollmentsCount);

                            usersList.add(user);
                        }
                    });
                }
                responseMap.put("status", Boolean.TRUE);
                responseMap.put("enrolledStudents", usersList);
                return ResponseEntity.ok(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "batch not found");
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchTestsByBatchForAdmin(Long batchId, String testTypeString) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            LinkedList<TestDB> testDBList = new LinkedList<>();

            if (!Objects.isNull(batchId)) {

                Optional<List<BatchTestRelationEntity>> enrolledBatchTests;

                if(Objects.equals("LIVE_TEST", testTypeString)) {

                    enrolledBatchTests = lmsDaoInterf.fetchBatchTests(batchId, TestType.LIVE_TEST);
                }
                else if(Objects.equals("MOCK_TEST", testTypeString)){
                    enrolledBatchTests = lmsDaoInterf.fetchBatchTests(batchId, TestType.MOCK_TEST);
                }
                else {

                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "Proper test type is needed");

                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

                if (enrolledBatchTests.isPresent()) {

                    List<BatchTestRelationEntity> fetchTestIds = enrolledBatchTests.get();

                    fetchTestIds.forEach(tests -> {

                        Optional<TestDB> presentTest = lmsDaoInterf.findTestById(tests.getTestId());

                        if (presentTest.isPresent()) {

                            Optional<BatchCourseRelationEntity> batchCourseRelationEntity = lmsDaoInterf.findByBatchIdAndCourseId(batchId, presentTest.get().getLibraryMasterDB().getMaterialId());

                            UserInfoDB assignedTutorName = new UserInfoDB();

                            if(batchCourseRelationEntity.isPresent()) {
                                assignedTutorName = lmsDaoInterf.getUserInfoById(batchCourseRelationEntity.get().getTutorId()).orElse(null);
                            }

                            presentTest.get().setTestQuestionsDB(null);
                            presentTest.get().setBatchId(batchId);
                            if(!Objects.isNull(assignedTutorName)) {
                                presentTest.get().setTutorName(assignedTutorName.getFullName());
                            }
                            presentTest.get().setMaterialName(presentTest.get().getLibraryMasterDB().getMaterialName());
                            presentTest.get().setMaterialId(presentTest.get().getLibraryMasterDB().getMaterialId());
                            presentTest.get().setSubject(presentTest.get().getLibraryMasterDB().getMaterialName());
                            testDBList.add(presentTest.get());
                        }

                    });

                    LinkedList<TestDB> newList = testDBList.stream().sorted(Comparator.comparing(TestDB :: getCreationTimeStamp)).collect(Collectors.toCollection(LinkedList :: new));

                    responseMap.put("tests", newList);
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);

                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "No test found in the batch");
                return ResponseEntity.unprocessableEntity().body(responseMap);

            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Batch id is mandatory");
            return ResponseEntity.unprocessableEntity().body(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> unEnrolledStudents(int page, int size) {

        HashMap<String, Object> responseMap = new HashMap<>();
        try {
            LinkedHashSet<UserInfoDB> unEnrolledStudentDetailsList = new LinkedHashSet <>();

//            Optional<List<RolesDB>> optionalStudentRoles = lmsDaoInterf.fetchAllStudentList();

            Pageable pageable = PageRequest.of(page,size);

            Page<RolesDB> allStudentsPage = lmsDaoInterf.getAllUsersByRole("STUDENT",pageable).orElseGet(Page::empty);

            List<RolesDB> optionalStudentRoles = allStudentsPage.getContent();

            if (!optionalStudentRoles.isEmpty()) {

//                List<RolesDB> registeredStudents = optionalStudentRoles.get();

                // Iterate through each student's roles
                optionalStudentRoles.stream()
                        .flatMap(role -> role.getUserInfo().stream()) // Stream UserInfo from each role
                        .forEach(userInfo -> {

                            // Remove non required info
                            userInfo.setRoles(null);
                            userInfo.setUserCredentialsDB(null);
                            userInfo.setOrganizationsDB(null);

                            // Fetch batch enrollments for the user
                            Optional<List<BatchStudentEnrollmentsDB>> enrolledStudents = lmsDaoInterf.fetchStudentBatchEnrollments(userInfo.getUserDetailsId());

                            // If the student is not enrolled in any batch, add them to the list
                            if (enrolledStudents.isEmpty() || enrolledStudents.get().isEmpty()) {
                                unEnrolledStudentDetailsList.add(userInfo);
                            }
                        });


                if (!unEnrolledStudentDetailsList.isEmpty()) {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("students", unEnrolledStudentDetailsList);
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "No unEnrolled students found");
                return ResponseEntity.ok(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "No students found");
            return ResponseEntity.unprocessableEntity().body(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    // enroll student to batch
    @Override
    public ResponseEntity<Map<String, Object>> enrollStudentToBatch(BatchEnrollmentEntity batchEnrollmentEntity) {
        // Initialize response map to store the response data
        HashMap<String, Object> responseMap = new HashMap<>();
        LinkedList<String> successfulEnrollments = new LinkedList<>();
        LinkedList<String> failedEnrollments = new LinkedList<>();

        try {
            // Fetch batch information based on the provided batch ID
            Optional<BatchDB> batchDB = lmsDaoInterf.findBatchById(batchEnrollmentEntity.getBatchId());

            // Check if batch information is present
            if (batchDB.isPresent()) {
                for (String userName : batchEnrollmentEntity.getUserName()) {
                    // Fetch user information based on the provided username
                    Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(userName);

                    // Check if user information is present
                    if (userInfoDB.isPresent()) {
                        // Fetch student batch enrollments based on the user details ID
                        Optional<List<BatchStudentEnrollmentsDB>> batchEnrollments = lmsDaoInterf.fetchStudentBatchEnrollments(userInfoDB.get().getUserDetailsId());

                        // Check if there are any existing enrollments
                        if (batchEnrollments.isPresent() && !batchEnrollments.get().isEmpty()) {
                            // Filter the enrollments to check if the student is already enrolled in the specified batch
//                            List<BatchStudentEnrollmentsDB> batchStudentEnrollmentsDBList = batchEnrollments.get().stream()
//                                    .filter(batchEnrollmentsDBS -> batchEnrollmentsDBS.getBatchDB().getBatchId().equals(batchEnrollmentEntity.getBatchId()))
//                                    .toList();

                            // If the student is already enrolled, add to failed list
//                            if (!batchStudentEnrollmentsDBList.isEmpty()) {
                            failedEnrollments.add(userName + ": ALREADY_ENROLLED");
                            continue;
//                            }
                        }

                        // Check if max enrollments into a batch is exceeded
                        if (Objects.equals(batchDB.get().getBatchCapacity(), batchDB.get().getNumberOfEnrolledStudents())) {
                            failedEnrollments.add(userName + ": MAX_ENROLLMENTS_EXCEEDED");
                            continue;
                        }

                        // Increase the number of students enrollment by 1
                        batchDB.get().setNumberOfEnrolledStudents(batchDB.get().getNumberOfEnrolledStudents() == null ? 1 : batchDB.get().getNumberOfEnrolledStudents() + 1);

                        // Create a new BatchStudentEnrollmentsDB entity for the new enrollment
                        BatchStudentEnrollmentsDB batchStudentEnrollmentsDB = new BatchStudentEnrollmentsDB();
                        batchStudentEnrollmentsDB.setStudentId(userInfoDB.get().getUserDetailsId());
                        batchStudentEnrollmentsDB.setBatchDB(batchDB.get());
                        batchStudentEnrollmentsDB.setEnrollmentDate(LocalDateTime.now());
                        batchStudentEnrollmentsDB.setIsActive(Boolean.TRUE);
                        batchStudentEnrollmentsDB.setCreatedBy(userInfoDB.get().getUserDetailsId());

                        // Add the new enrollment to the batch
                        batchDB.get().getBatchStudentEnrollmentsDB().add(batchStudentEnrollmentsDB);

                        // Persist the batch with the new enrollment
                        BatchDB persistedBatchDB = lmsDaoInterf.persistBatchMaster(batchDB.get());

                        List<BatchCourseRelationEntity> enrolledCoursesOfBatch = lmsDaoInterf.fetchBatchCourses(persistedBatchDB.getBatchId()).orElse(Collections.emptyList());

                        if(!enrolledCoursesOfBatch.isEmpty()){

                            // List to add enrollments to course
                            LinkedList<MaterialEnrollmentDB> materialEnrollmentDBList = new LinkedList<>();

                            enrolledCoursesOfBatch.forEach(batchCourseRelationEntity -> {

                                MaterialEnrollmentDB materialEnrollmentDB = new MaterialEnrollmentDB();
                                materialEnrollmentDB.setIsActive(Boolean.TRUE);
                                materialEnrollmentDB.setMaterialId(batchCourseRelationEntity.getCourseId());
                                materialEnrollmentDB.setUsername(userInfoDB.get().getEmail());
                                materialEnrollmentDB.setCreationTimeStamp(LocalDateTime.now());

                                // Adding the material enrollment to the enrollments list
                                materialEnrollmentDBList.add(materialEnrollmentDB);

                            });

                            // Save All Enrollments to course
                            Boolean isEnrolledToCourses = lmsDaoInterf.saveAllMaterialEnrollments(materialEnrollmentDBList);

                            if (isEnrolledToCourses)
                                responseMap.put("message_Enrollment_to_course", "STUDENTS_ENROLLED_TO_MATERIAL");
                            else
                                responseMap.put("message_Enrollment_to_course", "STUDENTS_NOT_ENROLLED_TO_MATERIAL");
                        }

                        List<BatchTestRelationEntity> batchTests = lmsDaoInterf.fetchBatchTests(batchEnrollmentEntity.getBatchId(), TestType.LIVE_TEST).orElse(Collections.emptyList());

                        if(!batchTests.isEmpty()){
                            LinkedList<TestStudentRelation> testStudentRelationList = new LinkedList<>();

                            batchEnrollmentEntity.getUserName().forEach(username -> batchTests.forEach(batchTestRelationEntity -> {
                                TestStudentRelation testStudentRelation = new TestStudentRelation();

                                testStudentRelation.setIsTestAttempted(Boolean.FALSE);
                                testStudentRelation.setTestId(batchTestRelationEntity.getTestId());
                                lmsDaoInterf.getUserInfo(username).ifPresent(
                                    user -> testStudentRelation.setStudentId(user.getUserDetailsId())
                                );
                                testStudentRelationList.add(testStudentRelation);
                            }));

                            Boolean areTestsAssigned = lmsDaoInterf.saveAllTestStudentRelation(testStudentRelationList);

                            if(areTestsAssigned)
                                responseMap.put("message_test_Assigned_to_students", "AVAILABLE_TEST_ASSIGNED_TO_STUDENTS");
                            else
                                responseMap.put("message_test_Assigned_to_students", "AVAILABLE_TEST_NOT_ASSIGNED_TO_STUDENTS");
                        }

                        // Check if the batch was persisted successfully and update lists accordingly
                        if (!Objects.isNull(persistedBatchDB.getBatchId())) {
                            successfulEnrollments.add(userName);
                        } else {
                            failedEnrollments.add(userName + ": PERSISTENCE_ERROR");
                        }
                    } else {
                        failedEnrollments.add(userName + ": USER_NOT_FOUND");
                    }
                }

                // Prepare the response map with details of successful and failed enrollments
                responseMap.put("status", !successfulEnrollments.isEmpty());
                responseMap.put("successfulEnrollments", successfulEnrollments);
                responseMap.put("failedEnrollments", failedEnrollments);

                if (successfulEnrollments.isEmpty()) {
                    return ResponseEntity.badRequest().body(responseMap);
                } else {
                    return ResponseEntity.ok(responseMap);
                }
            } else {
                // If batch information is not found, return an internal server error response
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "BATCH_NOT_FOUND");
                return ResponseEntity.internalServerError().body(responseMap);
            }
        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    // enroll tutor to batch

    @Override
    public ResponseEntity<Map<String, Object>> enrollTutorToBatch(BatchEnrollmentEntity batchEnrollmentEntity) {
        // Initialize response map to store the response data
        HashMap<String, Object> responseMap = new HashMap<>();
        LinkedList<String> successfulEnrollments = new LinkedList<>();
        LinkedList<String> failedEnrollments = new LinkedList<>();

        try {
            // Fetch batch information based on the provided batch ID
            Optional<BatchDB> batchDB = lmsDaoInterf.findBatchById(batchEnrollmentEntity.getBatchId());

            // Check if batch information is present
            if (batchDB.isPresent()) {
                for (String userName : batchEnrollmentEntity.getUserName()) {
                    // Fetch user information based on the provided username
                    Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(userName);

                    // Check if user information is present
                    if (userInfoDB.isPresent()) {
                        // Fetch tutor batch enrollments based on the user details ID
                        Optional<List<BatchTutorEnrollmentDB>> batchEnrollments = lmsDaoInterf.fetchTutorBatchEnrollments(userInfoDB.get().getUserDetailsId());

                        // Check if there are any existing enrollments
                        if (batchEnrollments.isPresent() && !batchEnrollments.get().isEmpty()) {
                            // Filter the enrollments to check if the tutor is already enrolled in the specified batch
                            List<BatchTutorEnrollmentDB> batchTutorEnrollmentsDBList = batchEnrollments.get().stream()
                                    .filter(batchEnrollmentsDBS -> batchEnrollmentsDBS.getBatchDB().getBatchId().equals(batchEnrollmentEntity.getBatchId()))
                                    .toList();

                            // If the tutor is already enrolled, add to failed list
                            if (!batchTutorEnrollmentsDBList.isEmpty()) {
                                failedEnrollments.add(userName + ": ALREADY_ENROLLED");
                                continue;
                            }
                        }

                        // Create a new BatchTutorEnrollmentDB entity for the new enrollment
                        BatchTutorEnrollmentDB batchTutorEnrollmentDB = new BatchTutorEnrollmentDB();
                        batchTutorEnrollmentDB.setTutorId(userInfoDB.get().getUserDetailsId());
                        batchTutorEnrollmentDB.setBatchDB(batchDB.get());
                        batchTutorEnrollmentDB.setEnrollmentDate(LocalDateTime.now());
                        batchTutorEnrollmentDB.setIsActive(Boolean.TRUE);
                        batchTutorEnrollmentDB.setCreatedBy(userInfoDB.get().getUserDetailsId());

                        // Add the new tutor enrollment to the batch
                        batchDB.get().getBatchTutorEnrollmentsDB().add(batchTutorEnrollmentDB);

                        // Persist the batch with the new enrollment
                        BatchDB persistedBatchDB = lmsDaoInterf.persistBatchMaster(batchDB.get());

                        // Check if the batch was persisted successfully and update lists accordingly
                        if (!Objects.isNull(persistedBatchDB)) {
                            successfulEnrollments.add(userName);
                        } else {
                            failedEnrollments.add(userName + ": PERSISTENCE_ERROR");
                        }
                    } else {
                        failedEnrollments.add(userName + ": USER_NOT_FOUND");
                    }
                }

                // Prepare the response map with details of successful and failed enrollments
                responseMap.put("status", !successfulEnrollments.isEmpty());
                responseMap.put("successfulEnrollments", successfulEnrollments);
                responseMap.put("failedEnrollments", failedEnrollments);

                if (successfulEnrollments.isEmpty()) {
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                } else {
                    return ResponseEntity.ok(responseMap);
                }
            } else {
                // If batch information is not found, return an internal server error response
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "BATCH_NOT_FOUND");
                return ResponseEntity.internalServerError().body(responseMap);
            }
        } catch (Exception e) {
            // Log the exception and return an internal server error response
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchCourseMaster(Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            List<LibraryMasterDB> libraryMasterDBList = lmsDaoInterf.fetchLibraryMaster().orElse(Collections.emptyList());

            List<BatchCourseRelationEntity> batchCourseRelationEntityList = lmsDaoInterf.fetchBatchCourses(batchId).orElse(Collections.emptyList());


            // Extract the courseIds from batchCourseRelationEntityList
            List<Long> batchCourseIds = batchCourseRelationEntityList.stream()
                    .map(BatchCourseRelationEntity::getCourseId)
                    .toList();

            // Filter out courses from libraryMasterDBList that are not in batchCourseIds
            List<LibraryMasterDB> filteredLibraryMasterDBList = libraryMasterDBList.stream()
                    .filter(course -> !batchCourseIds.contains(course.getMaterialId()))
                    .toList();

            LinkedList<CourseMaster> courseMasterList = new LinkedList<>();

            filteredLibraryMasterDBList.forEach(libraryMasterDB -> {

                CourseMaster courseMaster = new CourseMaster();
                courseMaster.setCourseName(libraryMasterDB.getMaterialName());
                courseMaster.setCourseCode(libraryMasterDB.getMaterialCode());
                courseMaster.setCourseId(libraryMasterDB.getMaterialId());
                courseMaster.setCoursePrice(libraryMasterDB.getDiscountedPrice());

                courseMasterList.add(courseMaster);

            });

            responseMap.put("courses", courseMasterList);
            responseMap.put("status", Boolean.TRUE);

            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> removeBatchCourseRelation(Long batchId, Long tutorId, Long courseId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            Optional<BatchCourseRelationEntity> optionalBatchCourseRelationEntity = lmsDaoInterf.fetchBatchCoursesForRemove(batchId, tutorId, courseId);

            if (optionalBatchCourseRelationEntity.isPresent()) {


                optionalBatchCourseRelationEntity.get().setIsActive(Boolean.FALSE);
                Boolean isRemoved = lmsDaoInterf.saveBatchCourseRelation(optionalBatchCourseRelationEntity.get());

                if (isRemoved) {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "Batch course removed");
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Batch course not removed");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Batch courses not found");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> removeBatchTestsRelation(Long batchId, Long courseId, Long testId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            Optional<BatchTestRelationEntity> optionalBatchTestRelationEntity = lmsDaoInterf.fetchBatchTestsForRemove(batchId, courseId, testId);

            Optional<TestDB> optionalTestEntity = lmsDaoInterf.findTestById(testId);

            if (optionalBatchTestRelationEntity.isPresent() && optionalTestEntity.isPresent()) {

                optionalTestEntity.get().setIsActive(Boolean.FALSE);
                TestDB isTestRemoved = lmsDaoInterf.saveTestMaster(optionalTestEntity.get());

                optionalBatchTestRelationEntity.get().setIsActive(Boolean.FALSE);
                Boolean isRemoved = lmsDaoInterf.saveBatchTestRelation(optionalBatchTestRelationEntity.get());

                if (isRemoved && !Objects.isNull(isTestRemoved.getTestId())) {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "Batch test removed");
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Batch test not removed");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Batch tests not found");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> removeStudentBatchEnrollments(Long studentId, Long batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            Optional<BatchStudentEnrollmentsDB> optionalBatchStudentEnrollmentsDB = lmsDaoInterf.findBatchStudents(studentId, batchId);

            if (optionalBatchStudentEnrollmentsDB.isPresent()) {


                optionalBatchStudentEnrollmentsDB.get().setIsActive(Boolean.FALSE);
                Boolean isRemoved = lmsDaoInterf.saveBatchStudents(optionalBatchStudentEnrollmentsDB.get());

                if (isRemoved) {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "Student from batch removed");
                    return ResponseEntity.ok(responseMap);
                }

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Student from batch not removed");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            responseMap.put("status", Boolean.FALSE);
            responseMap.put("message", "Batch student enrollment not found");
            return ResponseEntity.unprocessableEntity().body(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalUsers(Optional<Long> branchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            AtomicInteger totalStudents = new AtomicInteger();
            AtomicInteger totalTeachers = new AtomicInteger();
            AtomicInteger totalAdmins = new AtomicInteger();

            Optional<List<RolesDB>> studentList = lmsDaoInterf.fetchAllStudentList();
            Optional<List<RolesDB>> teacherList = lmsDaoInterf.fetchAllTeacherList();
            Optional<List<RolesDB>> adminList = lmsDaoInterf.fetchAllAdminList();
            Optional<List<RolesDB>> superAdminList = lmsDaoInterf.fetchAllSuperAdminList();

            if(branchId.isPresent()) {

                totalStudents.set(countDistinctUsersByBranch(studentList.orElse(Collections.emptyList()), branchId.get()));
                totalTeachers.set(countDistinctUsersByBranch(teacherList.orElse(Collections.emptyList()), branchId.get()));
                totalAdmins.set(
                        countDistinctUsersByBranch(adminList.orElse(Collections.emptyList()), branchId.get())
                                + countDistinctUsersByBranch(superAdminList.orElse(Collections.emptyList()), branchId.get())
                );

            }
            else {

                totalStudents.set(countDistinctUsers(studentList.orElse(Collections.emptyList())));
                totalTeachers.set(countDistinctUsers(teacherList.orElse(Collections.emptyList())));
                totalAdmins.set(
                        countDistinctUsers(adminList.orElse(Collections.emptyList()))
                                + countDistinctUsers(superAdminList.orElse(Collections.emptyList()))
                );

            }

            int totalUsers = totalStudents.get() + totalTeachers.get() + totalAdmins.get();

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("totalUsers", totalUsers);
            responseMap.put("totalStudents", totalStudents.get());
            responseMap.put("totalTeachers", totalTeachers.get());
            responseMap.put("totalAdmins", totalAdmins.get());
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> fetchAdminDashboardSummary(Optional<Long> branchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<List<RolesDB>> studentList = lmsDaoInterf.fetchAllStudentList();
            Optional<List<RolesDB>> teacherList = lmsDaoInterf.fetchAllTeacherList();
            Optional<List<RolesDB>> adminList = lmsDaoInterf.fetchAllAdminList();
            Optional<List<RolesDB>> superAdminList = lmsDaoInterf.fetchAllSuperAdminList();

            List<RolesDB> students = studentList.orElse(Collections.emptyList());
            List<RolesDB> teachers = teacherList.orElse(Collections.emptyList());
            List<RolesDB> admins = adminList.orElse(Collections.emptyList());
            List<RolesDB> superAdmins = superAdminList.orElse(Collections.emptyList());

            int totalStudents = branchId
                    .map(id -> countDistinctUsersByBranch(students, id))
                    .orElseGet(() -> countDistinctUsers(students));
            int totalTeachers = branchId
                    .map(id -> countDistinctUsersByBranch(teachers, id))
                    .orElseGet(() -> countDistinctUsers(teachers));
            int totalAdmins = branchId
                    .map(id -> countDistinctUsersByBranch(admins, id) + countDistinctUsersByBranch(superAdmins, id))
                    .orElseGet(() -> countDistinctUsers(admins) + countDistinctUsers(superAdmins));
            int totalUsers = totalStudents + totalTeachers + totalAdmins;

            int activeUsersToday = branchId
                    .map(id -> countDistinctActiveUsersTodayByBranch(students, teachers, admins, superAdmins, id))
                    .orElseGet(() -> countDistinctActiveUsersToday(students, teachers, admins, superAdmins));

            List<BatchDB> batchList = branchId
                    .map(lmsDaoInterf::findAllBatchesByOrganizationId)
                    .orElseGet(() -> lmsDaoInterf.findAllBatches().orElse(Collections.emptyList()));

            int upcomingBatches = 0;
            int ongoingBatches = 0;
            int completedBatches = 0;
            LocalDateTime now = LocalDateTime.now();

            for (BatchDB batchDB : batchList) {
                if (batchDB == null || batchDB.getBatchStartDateTime() == null || batchDB.getBatchEndDateTime() == null) {
                    continue;
                }

                if (batchDB.getBatchStartDateTime().isAfter(now)) {
                    upcomingBatches++;
                } else if (batchDB.getBatchStartDateTime().isBefore(now) && batchDB.getBatchEndDateTime().isAfter(now)) {
                    ongoingBatches++;
                } else if (batchDB.getBatchEndDateTime().isBefore(now)) {
                    completedBatches++;
                }
            }

            int totalBatches = upcomingBatches + ongoingBatches + completedBatches;

            List<LibraryMasterDB> activeCourses = lmsDaoInterf.fetchLibraryMaster().orElse(Collections.emptyList());
            List<LibraryMasterDB> courseList = branchId
                    .map(orgId -> activeCourses.stream()
                            .filter(course -> belongsToBranch(course, orgId))
                            .toList())
                    .orElse(activeCourses);

            long skillPrograms = courseList.stream()
                    .filter(course -> Boolean.TRUE.equals(course.getIsCertificationRequired()))
                    .count();

            long classroomPrograms = courseList.stream()
                    .filter(course -> !Boolean.TRUE.equals(course.getIsCertificationRequired()))
                    .count();

            long totalCourses = skillPrograms + classroomPrograms;

            long totalAssignments = courseList.stream()
                    .filter(Objects::nonNull)
                    .map(LibraryMasterDB::getMaterialDescDB)
                    .filter(Objects::nonNull)
                    .map(MaterialDescDB::getNumberOfAssignments)
                    .filter(Objects::nonNull)
                    .mapToLong(Long::longValue)
                    .sum();

            Optional<List<HelpAndSupportEntity>> fetchAllResolvedHelpAndSupport = branchId.isPresent()
                    ? lmsDaoInterf.findAllTimeHelpAndSupport(branchId.get(), Boolean.TRUE)
                    : lmsDaoInterf.findAllTimeHelpAndSupport(null, Boolean.TRUE);
            Optional<List<HelpAndSupportEntity>> fetchAllUnResolvedHelpAndSupport = branchId.isPresent()
                    ? lmsDaoInterf.findAllTimeHelpAndSupport(branchId.get(), Boolean.FALSE)
                    : lmsDaoInterf.findAllTimeHelpAndSupport(null, Boolean.FALSE);

            int resolvedConcerns = fetchAllResolvedHelpAndSupport.map(List::size).orElse(0);
            int unResolvedConcerns = fetchAllUnResolvedHelpAndSupport.map(List::size).orElse(0);
            int totalConcerns = resolvedConcerns + unResolvedConcerns;

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("totalUsers", totalUsers);
            responseMap.put("totalStudents", totalStudents);
            responseMap.put("totalTeachers", totalTeachers);
            responseMap.put("totalAdmins", totalAdmins);
            responseMap.put("activeUsersToday", activeUsersToday);
            responseMap.put("totalBatches", totalBatches);
            responseMap.put("upcomingBatches", upcomingBatches);
            responseMap.put("ongoingBatches", ongoingBatches);
            responseMap.put("completedBatches", completedBatches);
            responseMap.put("totalCourses", totalCourses);
            responseMap.put("skillPrograms", skillPrograms);
            responseMap.put("classroomPrograms", classroomPrograms);
            responseMap.put("totalAssignments", totalAssignments);
            responseMap.put("totalConcerns", totalConcerns);
            responseMap.put("resolvedConcerns", resolvedConcerns);
            responseMap.put("unResolvedConcerns", unResolvedConcerns);
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    private int countDistinctUsers(List<RolesDB> roleEntries) {
        return (int) roleEntries.stream()
                .filter(Objects::nonNull)
                .flatMap(roleEntry -> Objects.isNull(roleEntry.getUserInfo()) ? Collections.<UserInfoDB>emptySet().stream() : roleEntry.getUserInfo().stream())
                .filter(Objects::nonNull)
                .map(UserInfoDB::getUserDetailsId)
                .filter(Objects::nonNull)
                .distinct()
                .count();
    }

    private int countDistinctUsersByBranch(List<RolesDB> roleEntries, Long branchId) {
        return (int) roleEntries.stream()
                .filter(Objects::nonNull)
                .flatMap(roleEntry -> Objects.isNull(roleEntry.getUserInfo()) ? Collections.<UserInfoDB>emptySet().stream() : roleEntry.getUserInfo().stream())
                .filter(Objects::nonNull)
                .filter(userInfo -> !Objects.isNull(userInfo.getOrganizationsDB()))
                .filter(userInfo -> Objects.equals(userInfo.getOrganizationsDB().getOrgId(), branchId))
                .map(UserInfoDB::getUserDetailsId)
                .filter(Objects::nonNull)
                .distinct()
                .count();
    }

    private int countDistinctActiveUsersToday(List<RolesDB>... roleGroups) {
        return (int) Arrays.stream(roleGroups)
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .filter(Objects::nonNull)
                .flatMap(roleEntry -> Objects.isNull(roleEntry.getUserInfo()) ? Collections.<UserInfoDB>emptySet().stream() : roleEntry.getUserInfo().stream())
                .filter(Objects::nonNull)
                .filter(this::isUserActiveToday)
                .map(UserInfoDB::getUserDetailsId)
                .filter(Objects::nonNull)
                .distinct()
                .count();
    }

    private int countDistinctActiveUsersTodayByBranch(List<RolesDB> students, List<RolesDB> teachers, List<RolesDB> admins, List<RolesDB> superAdmins, Long branchId) {
        return (int) Arrays.asList(students, teachers, admins, superAdmins).stream()
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .filter(Objects::nonNull)
                .flatMap(roleEntry -> Objects.isNull(roleEntry.getUserInfo()) ? Collections.<UserInfoDB>emptySet().stream() : roleEntry.getUserInfo().stream())
                .filter(Objects::nonNull)
                .filter(userInfo -> !Objects.isNull(userInfo.getOrganizationsDB()))
                .filter(userInfo -> Objects.equals(userInfo.getOrganizationsDB().getOrgId(), branchId))
                .filter(this::isUserActiveToday)
                .map(UserInfoDB::getUserDetailsId)
                .filter(Objects::nonNull)
                .distinct()
                .count();
    }

    private boolean isUserActiveToday(UserInfoDB userInfoDB) {
        LocalDate today = LocalDate.now();
        LocalDate updatedDate = Optional.ofNullable(userInfoDB.getUpdationTimeStamp())
                .map(LocalDateTime::toLocalDate)
                .orElse(null);
        LocalDate createdDate = Optional.ofNullable(userInfoDB.getCreationTimeStamp())
                .map(LocalDateTime::toLocalDate)
                .orElse(null);
        return Objects.equals(updatedDate, today) || Objects.equals(createdDate, today);
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalConcerns(Optional<Long> branchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            int resolvedConcerns = 0, unResolvedConcerns = 0;
	        
	        Optional <List <HelpAndSupportEntity>> fetchAllResolvedHelpAndSupport;
	        Optional <List <HelpAndSupportEntity>> fetchAllUnResolvedHelpAndSupport;
	        if(branchId.isPresent()) {
		        fetchAllResolvedHelpAndSupport   = lmsDaoInterf.findAllTimeHelpAndSupport(branchId.get(), Boolean.TRUE);
		        fetchAllUnResolvedHelpAndSupport = lmsDaoInterf.findAllTimeHelpAndSupport(branchId.get(), Boolean.FALSE);
		        
	        }
            else {
		        fetchAllResolvedHelpAndSupport   = lmsDaoInterf.findAllTimeHelpAndSupport(null, Boolean.TRUE);
		        fetchAllUnResolvedHelpAndSupport = lmsDaoInterf.findAllTimeHelpAndSupport(null, Boolean.FALSE);
		        
	        }
	        if (fetchAllResolvedHelpAndSupport.isPresent()) {
	            resolvedConcerns = fetchAllResolvedHelpAndSupport.get().size();
	        }
	        if (fetchAllUnResolvedHelpAndSupport.isPresent()) {
	            unResolvedConcerns = fetchAllUnResolvedHelpAndSupport.get().size();
	        }
	        
	        int totalConcerns = resolvedConcerns + unResolvedConcerns;

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("totalConcerns", totalConcerns);
            responseMap.put("resolvedConcerns", resolvedConcerns);
            responseMap.put("unResolvedConcerns", unResolvedConcerns);
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalBatches(Optional<Long> branchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            LinkedList<BatchDB> upcomingBatchList = new LinkedList<>();
            LinkedList<BatchDB> ongoingBatchList= new LinkedList<>();
            LinkedList<BatchDB> completedBatchList = new LinkedList<>();

            int upcomingBatches = 0, ongoingBatches = 0, completedBatches = 0;

            List<BatchDB> batchList;

            if(branchId.isPresent()) {
                batchList = lmsDaoInterf.findAllBatchesByOrganizationId(branchId.get());
            }
            else {
                batchList = lmsDaoInterf.findAllBatches().orElse(Collections.emptyList());
            }

            if(!batchList.isEmpty()) {

                batchList.forEach(batchDB -> {
                    LocalDateTime now = LocalDateTime.now();

                    // Categorize based on start and end date
                    if (batchDB.getBatchStartDateTime().isAfter(now)) {
                        upcomingBatchList.add(batchDB);
                    } else if (batchDB.getBatchStartDateTime().isBefore(now) && batchDB.getBatchEndDateTime().isAfter(now)) {
                        ongoingBatchList.add(batchDB);
                    } else if (batchDB.getBatchEndDateTime().isBefore(now)) {
                        completedBatchList.add(batchDB);
                    }
                });


                if(!upcomingBatchList.isEmpty()) { upcomingBatches = upcomingBatchList.size(); }
                if(!ongoingBatchList.isEmpty()) { ongoingBatches = ongoingBatchList.size(); }
                if(!completedBatchList.isEmpty()) { completedBatches = completedBatchList.size(); }

            } else {

                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Batches not found");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            int totalBatches = upcomingBatches + ongoingBatches + completedBatches;

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("totalBatches", totalBatches);
            responseMap.put("upcomingBatches", upcomingBatches);
            responseMap.put("ongoingBatches", ongoingBatches);
            responseMap.put("completedBatches", completedBatches);
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> fetchAdminDashboardTotalCourses(Optional<Long> branchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {

            List<LibraryMasterDB> activeCourses = lmsDaoInterf.fetchLibraryMaster().orElse(Collections.emptyList());

            List<LibraryMasterDB> courseList = branchId
                    .map(orgId -> activeCourses.stream()
                            .filter(course -> belongsToBranch(course, orgId))
                            .toList())
                    .orElse(activeCourses);

            long skillPrograms = courseList.stream()
                    .filter(course -> Boolean.TRUE.equals(course.getIsCertificationRequired()))
                    .count();

            long classroomPrograms = courseList.stream()
                    .filter(course -> !Boolean.TRUE.equals(course.getIsCertificationRequired()))
                    .count();

            long totalCourses = skillPrograms + classroomPrograms;

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("totalCourses", totalCourses);
            responseMap.put("skillPrograms", skillPrograms);
            responseMap.put("classroomPrograms", classroomPrograms);
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    private boolean belongsToBranch(LibraryMasterDB course, Long branchId) {
        return Optional.ofNullable(course)
                .map(LibraryMasterDB::getUserInfoDB)
                .map(UserInfoDB::getOrganizationsDB)
                .map(OrganizationsDB::getOrgId)
                .filter(orgId -> Objects.equals(orgId, branchId))
                .isPresent();
    }

    @Override
    public ResponseEntity<Map<String, Object>> getUserMaster(String role,int page, int size ) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            Pageable pageable = PageRequest.of(page,size);

            Page<RolesDB> allUsersPage = lmsDaoInterf.getAllUsersByRole(role,pageable).orElseGet(Page::empty);

            List<UserInfoDB> allUsers = allUsersPage.getContent().stream()
                    .flatMap(roleDB -> roleDB.getUserInfo().stream())
                    .toList();

            if(!allUsers.isEmpty()) {
                allUsers.forEach(userInfoDB -> {
                        if (Objects.equals(role, "STUDENT")) {

                            if (Objects.isNull(userInfoDB.getOrganizationsDB()) || Objects.isNull(userInfoDB.getOrganizationsDB().getBatchDB())) {
                                return;
                            }

                            List<BatchStudentEnrollmentsDB> batchStudentEnrollmentsDBList = userInfoDB.getOrganizationsDB().getBatchDB().stream()
                                    .filter(batchEnrollment -> !Objects.isNull(batchEnrollment.getBatchStudentEnrollmentsDB()))
                                    .flatMap(batchEnrollment -> batchEnrollment.getBatchStudentEnrollmentsDB().stream()
                                            .filter(batchEnroll -> Objects.equals(batchEnroll.getStudentId(), userInfoDB.getUserDetailsId()) && batchEnroll.getIsActive()))
                                    .toList();
                            if(!batchStudentEnrollmentsDBList.isEmpty()){
                                userInfoDB.setBatchId(batchStudentEnrollmentsDBList.getFirst().getBatchDB().getBatchId());
                                userInfoDB.setBatchName(batchStudentEnrollmentsDBList.getFirst().getBatchDB().getBatchName());
                                userInfoDB.setOrganizationsDB(batchStudentEnrollmentsDBList.getFirst().getBatchDB().getOrganizationsDB());
                            }
                        }
                });
            }
            List<UserInfoDB> userInfoDBList = allUsers.stream().peek(userInfo -> {
                userInfo.setUserCredentialsDB(null);
                if(!Objects.isNull(userInfo.getOrganizationsDB())) {
                    userInfo.getOrganizationsDB().setBatchDB(null);
                }
            }).toList();

            responseMap.put("totalPages", allUsersPage.getTotalPages());
            responseMap.put("users", userInfoDBList);

            return ResponseEntity.ok(responseMap);
        }catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> fetchAdminTestsQuestions(Long testId){

        HashMap<String, Object> responseMap = new HashMap<>();

        try{
            // fetch questionsDB
            Optional<List<TestQuestionsDB>> presentQuestions = lmsDaoInterf.findQuestionsFromTestId(testId);

            // check if List is present
            if(presentQuestions.isEmpty()){
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.internalServerError().body(responseMap);
            } else {

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
    public ResponseEntity<Boolean> deleteContent(Long contentId) {
        try{
            Boolean isDeleted = lmsDaoInterf.deleteContent(contentId);

            if(isDeleted)
                return ResponseEntity.ok(Boolean.TRUE);
            else
                return ResponseEntity.badRequest().body(Boolean.FALSE);
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            return ResponseEntity.internalServerError().body(Boolean.FALSE);
        }
    }


    @Override
    public ResponseEntity<Map<String, Object>> fetchAllHelpAndSupport(Long branchId, Boolean getIsResolved){

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);

            // fetch HelpAndSupport DB
            Optional<List<HelpAndSupportEntity>> presentHelpAndSupport = lmsDaoInterf.findAllHelpAndSupport(branchId, getIsResolved, threeMonthsAgo);

            // check if List is present
            if(presentHelpAndSupport.isEmpty()){
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.internalServerError().body(responseMap);
            } else {
                responseMap.put("data", presentHelpAndSupport.get());
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
    public ResponseEntity<Boolean> deleteHelpAndSupport(Long grievanceId) {
        try{
            lmsDaoInterf.deleteHelpAndSupport(grievanceId);
            return ResponseEntity.ok(Boolean.TRUE);
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            return ResponseEntity.internalServerError().body(Boolean.FALSE);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> saveCountryMaster(List<CountryMaster> countryMasterList) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{
            Boolean isCreated = lmsDaoInterf.saveCountryMaster(countryMasterList);

            if (isCreated){
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getCountryMaster() {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{
            List<CountryMaster> countryMasterList = lmsDaoInterf.getCountryMaster().orElse(Collections.emptyList());

            responseMap.put("countries", countryMasterList);

            return ResponseEntity.ok(responseMap);
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }



    @Override
    public ResponseEntity<Map<String, Object>> saveHolidayXsl(Long branchId, List<HolidayMaster> holidayMasterDBS)
    {
        HashMap<String, Object> responseMap = new HashMap<>();
        try
        {
            //extracting an object using testId
            Optional<OrganizationsDB> existingBranch = lmsDaoInterf.findOrganizationsById(branchId);

            //checking if an object is present or not
            if(existingBranch.isPresent())
            {
                //checking if an object is null or empty or not
                if(!Objects.isNull(holidayMasterDBS) && !holidayMasterDBS.isEmpty())
                {

                    //using for each to iterate over a list
                    holidayMasterDBS.forEach(holiday -> {

                        //setting reference
                        holiday.setOrganizationsDB(existingBranch.get());

                    });

                }

                //saving object
                List<HolidayMaster> holidayMaster = lmsDaoInterf.saveHolidayMaster(holidayMasterDBS);

                if(!Objects.isNull(holidayMaster))
                {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "holiday added successfully");
                    return ResponseEntity.ok(responseMap);
                }
                else
                {
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "holiday added unsuccessfully");
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }
            }
            else
            {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "branch id is mandatory");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

        }

        catch(Exception e)
        {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

}
