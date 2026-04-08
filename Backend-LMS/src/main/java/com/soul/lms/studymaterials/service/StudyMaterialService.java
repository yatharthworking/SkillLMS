package com.soul.lms.studymaterials.service;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.helper.HelperInterf;
import com.soul.lms.model.entity.modelmasters.enumentity.Content;
import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.studymaterial.*;
import com.soul.lms.model.entity.studymaterial.quiz.*;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.webinar.service.WebinarService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service("StudyMaterialService")
public class StudyMaterialService implements StudyMaterialServiceInterf{

    //logger
    private final Logger logger = LogManager.getLogger(WebinarService.class);

    private final LmsDaoInterf lmsDaoInterf;
    private final Environment environment;
    private final HelperInterf helperInterf;

    @Autowired
    public StudyMaterialService(LmsDaoInterf lmsDaoInterf, Environment environment, HelperInterf helperInterf) {
        super();
        this.lmsDaoInterf = lmsDaoInterf;
        this.environment = environment;
        this.helperInterf = helperInterf;
    }

    private double calculateDiscountedPrice(Double materialPrice, Double discountPercentage) {
        double safeMaterialPrice = materialPrice != null ? materialPrice : 0D;
        double safeDiscountPercentage = discountPercentage != null ? discountPercentage : 0D;
        return safeMaterialPrice - (safeMaterialPrice * safeDiscountPercentage / 100);
    }

    private UserInfoDB buildTutorSummary(UserInfoDB userInfoDB) {
        if (Objects.isNull(userInfoDB)) {
            return null;
        }

        UserInfoDB tutorSummary = new UserInfoDB();
        tutorSummary.setUserDetailsId(userInfoDB.getUserDetailsId());
        tutorSummary.setFullName(userInfoDB.getFullName());
        tutorSummary.setEmail(userInfoDB.getEmail());
        tutorSummary.setMobileNo(userInfoDB.getMobileNo());
        tutorSummary.setIsActive(userInfoDB.getIsActive());
        tutorSummary.setCreatedBy(userInfoDB.getCreatedBy());
        tutorSummary.setCreationTimeStamp(userInfoDB.getCreationTimeStamp());
        tutorSummary.setUpdatedBy(userInfoDB.getUpdatedBy());
        tutorSummary.setUpdationTimeStamp(userInfoDB.getUpdationTimeStamp());
        return tutorSummary;
    }

    private MaterialDescDB buildMaterialDescriptionSummary(MaterialDescDB materialDescDB) {
        if (Objects.isNull(materialDescDB)) {
            return null;
        }

        MaterialDescDB materialDescriptionSummary = new MaterialDescDB();
        materialDescriptionSummary.setMaterialDescId(materialDescDB.getMaterialDescId());
        materialDescriptionSummary.setMaterialBrief(materialDescDB.getMaterialBrief());
        materialDescriptionSummary.setNumberOfAssignments(materialDescDB.getNumberOfAssignments());
        materialDescriptionSummary.setNumberOfChapters(materialDescDB.getNumberOfChapters());
        materialDescriptionSummary.setDownloadableResources(materialDescDB.getDownloadableResources());
        materialDescriptionSummary.setCreatedBy(materialDescDB.getCreatedBy());
        materialDescriptionSummary.setCreationTimeStamp(materialDescDB.getCreationTimeStamp());
        materialDescriptionSummary.setUpdatedBy(materialDescDB.getUpdatedBy());
        materialDescriptionSummary.setUpdationTimeStamp(materialDescDB.getUpdationTimeStamp());
        return materialDescriptionSummary;
    }

    private ChaptersDB buildChapterSummary(ChaptersDB chaptersDB) {
        ChaptersDB chapterSummary = new ChaptersDB();
        chapterSummary.setChapterId(chaptersDB.getChapterId());
        chapterSummary.setChapterName(chaptersDB.getChapterName());
        chapterSummary.setChapterCode(chaptersDB.getChapterCode());
        chapterSummary.setIsActive(chaptersDB.getIsActive());
        chapterSummary.setCreatedBy(chaptersDB.getCreatedBy());
        chapterSummary.setCreationTimeStamp(chaptersDB.getCreationTimeStamp());
        chapterSummary.setUpdatedBy(chaptersDB.getUpdatedBy());
        chapterSummary.setUpdationTimeStamp(chaptersDB.getUpdationTimeStamp());
        chapterSummary.setQuizDB(null);
        chapterSummary.setContentsDBList(null);
        return chapterSummary;
    }

    private LibraryMasterDB buildCourseSummary(LibraryMasterDB libraryMasterDB, boolean includeMaterialDescription, boolean includeChapters, boolean includeEnrollmentCount) {
        LibraryMasterDB courseSummary = new LibraryMasterDB();
        courseSummary.setMaterialId(libraryMasterDB.getMaterialId());
        courseSummary.setMaterialName(libraryMasterDB.getMaterialName());
        courseSummary.setMaterialCode(libraryMasterDB.getMaterialCode());
        courseSummary.setMaterialPrice(libraryMasterDB.getMaterialPrice());
        courseSummary.setDiscountPercentage(libraryMasterDB.getDiscountPercentage());
        courseSummary.setDiscountedPrice(calculateDiscountedPrice(libraryMasterDB.getMaterialPrice(), libraryMasterDB.getDiscountPercentage()));
        courseSummary.setRating(libraryMasterDB.getRating());
        courseSummary.setTotalRatings(libraryMasterDB.getTotalRatings());
        courseSummary.setIsActive(libraryMasterDB.getIsActive());
        courseSummary.setMaterialImageDB(libraryMasterDB.getMaterialImageDB());
        courseSummary.setIsCertificationRequired(libraryMasterDB.getIsCertificationRequired());
        courseSummary.setPassingPercentage(libraryMasterDB.getPassingPercentage());
        courseSummary.setIsPublished(libraryMasterDB.getIsPublished());
        courseSummary.setCreatedBy(libraryMasterDB.getCreatedBy());
        courseSummary.setCreationTimeStamp(libraryMasterDB.getCreationTimeStamp());
        courseSummary.setUpdatedBy(libraryMasterDB.getUpdatedBy());
        courseSummary.setUpdationTimeStamp(libraryMasterDB.getUpdationTimeStamp());

        UserInfoDB tutorSummary = buildTutorSummary(libraryMasterDB.getUserInfoDB());
        courseSummary.setUserInfoDB(tutorSummary);
        if (!Objects.isNull(tutorSummary)) {
            courseSummary.setAssignedTeacherId(tutorSummary.getUserDetailsId());
            courseSummary.setAssignedTeacher(tutorSummary.getFullName());
        }

        if (!Objects.isNull(libraryMasterDB.getSubjectMasterDB())) {
            courseSummary.setSubjectId(libraryMasterDB.getSubjectMasterDB().getSubjectMasterId());
            courseSummary.setSubjectName(libraryMasterDB.getSubjectMasterDB().getSubjectName());
        }

        if (includeMaterialDescription) {
            courseSummary.setMaterialDescDB(buildMaterialDescriptionSummary(libraryMasterDB.getMaterialDescDB()));
        } else {
            courseSummary.setMaterialDescDB(null);
        }

        if (includeChapters) {
            List<ChaptersDB> chapterSummaries = libraryMasterDB.getChaptersDBList() == null
                    ? Collections.emptyList()
                    : libraryMasterDB.getChaptersDBList().stream()
                    .filter(ChaptersDB::getIsActive)
                    .map(this::buildChapterSummary)
                    .toList();
            courseSummary.setChaptersDBList(new ArrayList<>(chapterSummaries));
        } else {
            courseSummary.setChaptersDBList(null);
        }

        if (includeEnrollmentCount) {
            courseSummary.setTotalEnrolledStudents(lmsDaoInterf.countTotalEnrollmentsInCourse(libraryMasterDB.getMaterialId()));
        }

        courseSummary.setTestDB(null);
        return courseSummary;
    }

    //service layer method to fetch libraryMaster
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getLibraryMaster(String username, Optional<Boolean> isCompleted) {

        HashMap<String,Object> responseMap = new HashMap<>();

        try{
            
            //fetching a list of enrolled materialIds.
            List<MaterialEnrollmentDB> materialEnrollments = lmsDaoInterf.fetchEnrolledMaterials(username, isCompleted).orElseGet(Collections::emptyList);
            
            List<Long> enrolledMaterialIds = materialEnrollments.stream()
                    .map(MaterialEnrollmentDB::getMaterialId)
                    .toList();
            
            Optional<List<LibraryMasterDB>> libraryMasterDBList1;
            if (enrolledMaterialIds.isEmpty()) {
                libraryMasterDBList1 = lmsDaoInterf.fetchLibraryMaster();
            } else {
                libraryMasterDBList1 = lmsDaoInterf.fetchLibraryMasterWhereMaterialIdIsNot(Boolean.TRUE, enrolledMaterialIds);
            }

            responseMap.put("data", Collections.emptyList());

            libraryMasterDBList1.ifPresent(value -> {
                
                List <LibraryMasterDB> libraryMasterDBList = value.stream().peek(libraryMasterDB -> {
                    
                    // Calculate the discounted price
                    double discountedPrice = calculateDiscountedPrice(libraryMasterDB.getMaterialPrice(), libraryMasterDB.getDiscountPercentage());
                    libraryMasterDB.setDiscountedPrice(discountedPrice);

                    if(!Objects.isNull(libraryMasterDB.getSubjectMasterDB())) {
                        libraryMasterDB.setSubjectName(libraryMasterDB.getSubjectMasterDB().getSubjectName());
                        libraryMasterDB.setSubjectId(libraryMasterDB.getSubjectMasterDB().getSubjectMasterId());
                    }

                    // Populate assignedTeacher from userInfoDB
                    if (libraryMasterDB.getUserInfoDB() != null) {
                        libraryMasterDB.setAssignedTeacher(libraryMasterDB.getUserInfoDB().getFullName());
                    }
                    
                    // Remove the child test
                    libraryMasterDB.setTestDB(null);
                }).toList();
                
                responseMap.put("data", libraryMasterDBList);
            });
            

                return ResponseEntity.ok(responseMap);
                

        }catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to getInProgressMaterials based on username
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<MaterialEnrollmentDB>> getInProgressMaterials(String username, Optional<Boolean> isCompleted){
        
        return lmsDaoInterf.fetchEnrolledMaterials(username, isCompleted).map(enrollments -> {
            enrollments.forEach(enrollment -> {
               
                List <ChaptersDB> activeChapters = enrollment.getLibraryMasterDB().getChaptersDBList().stream().filter(ChaptersDB::getIsActive).toList();
                List<EnrolledChaptersDB> enrolledChaptersDBList = enrollment.getEnrolledChaptersDBList().stream().filter(enroll -> activeChapters.stream().anyMatch(enrollChap -> Objects.equals(enrollChap.getChapterId(), enroll.getChapterId()))).sorted(Comparator.comparing(EnrolledChaptersDB::getChapterId)).toList();
               
                enrollment.setEnrolledChaptersDBList(enrolledChaptersDBList);

                if(!Objects.isNull(enrollment.getLibraryMasterDB().getSubjectMasterDB())) {
                    enrollment.getLibraryMasterDB().setSubjectId(enrollment.getLibraryMasterDB().getSubjectMasterDB().getSubjectMasterId());
                    enrollment.getLibraryMasterDB().setSubjectName(enrollment.getLibraryMasterDB().getSubjectMasterDB().getSubjectName());
                }

            });
            return ResponseEntity.ok(enrollments);
        }).orElseGet(() -> ResponseEntity.ok(Collections.emptyList()));
    }
    
    //service layer method to submit quiz
    @Override
    public ResponseEntity<Map<String ,Object>> submitQuiz(List<Long> questionIds) {

        HashMap<String ,Object> responseMap = new HashMap<>();
        try{
            //here fetching the list of correctAnswers based on questionIds.
            List<QuizCorrectAnswersDB> quizCorrectAnswersDBList = lmsDaoInterf.fetchCorrectAnswers(questionIds).orElseGet(Collections::emptyList);

            //here checking if the quizCorrectAnswersDBList is empty or not
            if(!quizCorrectAnswersDBList.isEmpty()){

                // Extract the quizAnswerId from each QuizCorrectAnswersDB object and collect them into a List of Longs
                List<Long> correctAnswerIds = quizCorrectAnswersDBList.stream()
                        .map(quizCorrectAnswer -> quizCorrectAnswer.getQuizAnswersDB().getQuizAnswerId())
                        .toList();

                responseMap.put("correctAnswerIds",correctAnswerIds);
                return ResponseEntity.ok(responseMap);

            }else{

                //if the quizCorrectAnswersDBList is empty sending the emptyList with badRequest status
                responseMap.put("correctAnswerIds",Collections.emptyList());
                return ResponseEntity.badRequest().body(responseMap);
            }
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to mark a chapter as complete
    @Override
    public ResponseEntity<Map<String, Object>> markAsCompleteChapter(EnrolledChaptersDB completedChaptersDB) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching chapter details based on chapterId
            Optional<EnrolledChaptersDB> existingEnrollment = lmsDaoInterf.fetchEnrolledChapters(completedChaptersDB.getEnrolledChapterId());

            //here checking if chapters details with given chapterId is present or not
            if(existingEnrollment.isPresent()){
                
                //setting data members
                existingEnrollment.get().setChapterId(completedChaptersDB.getChapterId());
                existingEnrollment.get().setUsername(completedChaptersDB.getUsername());
                existingEnrollment.get().setIsActive(completedChaptersDB.getIsActive());
                existingEnrollment.get().setIsCompleted(completedChaptersDB.getIsCompleted());
                
                //whose who is a column
                existingEnrollment.get().setCreatedBy(completedChaptersDB.getCreatedBy());
                
                //Saving the completed chapter details
                    Boolean isSave = lmsDaoInterf.saveCompletedChapter(existingEnrollment.get());

                    if (isSave) {
                        //here handling the case of successful saving of completed Chapters
                        responseMap.put("message", "chapter Marked as complete");
                        responseMap.put("status", Boolean.TRUE);
                        return ResponseEntity.ok(responseMap);

                    } else {

                        //here handling the case of unsuccessful saving of completed Chapters
                        responseMap.put("message", "Failed to mark chapter as complete");
                        responseMap.put("status", Boolean.FALSE);
                        return ResponseEntity.unprocessableEntity().body(responseMap);

                    }
               
            }else{

                //here handling the case where chapter details with given chapterId is not found
                responseMap.put("message","Chapter with given chapterId does not exists or is not active");
                responseMap.put("status",Boolean.FALSE);
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
    public ResponseEntity<Map<String, Object>> markAsCompleteMaterial(MaterialEnrollmentDB materialEnrollmentDB)
    {
        HashMap<String, Object> responseMap = new HashMap<>();
        try
        {
            Optional<MaterialEnrollmentDB> existingMaterial = lmsDaoInterf.fetchEnrolledMaterialUsingId(materialEnrollmentDB.getMaterialId());
            
            if(existingMaterial.isPresent())
            {
                existingMaterial.get().setMaterialName(materialEnrollmentDB.getMaterialName());
                existingMaterial.get().setMaterialEnrollmentId(materialEnrollmentDB.getMaterialEnrollmentId());
                existingMaterial.get().setIsCompleted(materialEnrollmentDB.getIsCompleted());
                existingMaterial.get().setTutorName(materialEnrollmentDB.getTutorName());
                existingMaterial.get().setUsername(materialEnrollmentDB.getUsername());
               
                //whose who is a column
                existingMaterial.get().setUpdatedBy(materialEnrollmentDB.getUpdatedBy());
                existingMaterial.get().setUpdationTimeStamp(LocalDateTime.now());
                
                Boolean isSave = lmsDaoInterf.saveMaterialEnrollment(existingMaterial.get());
                
                if(isSave)
                {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "saved successfully");
                    
                    return ResponseEntity.ok(responseMap);
                }
                else
                {
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "saved unsuccessfully");
                    
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }
            }
            
            else
            {
                return ResponseEntity.unprocessableEntity().body(Collections.emptyMap());
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

    
    //service layer method to fetch completed materials details for a student
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getCompletedMaterials(String username, Optional<Boolean> isCompleted) {
        
        HashMap<String ,Object> responseMap = new HashMap<>();
        
        try{
            //fetching a list of enrolled materialIds.
            List<MaterialEnrollmentDB> materialEnrollments = lmsDaoInterf.fetchEnrolledMaterials(username, isCompleted).orElseGet(Collections::emptyList);
            
           List<MaterialEnrollmentDB> materialEnrollmentDBS = materialEnrollments.stream().peek(value -> {
                
                double discountedPrice = calculateDiscountedPrice(value.getLibraryMasterDB().getMaterialPrice(), value.getLibraryMasterDB().getDiscountPercentage());
                value.getLibraryMasterDB().setDiscountedPrice(discountedPrice);

               if(!Objects.isNull(value.getLibraryMasterDB().getSubjectMasterDB())) {
                   value.getLibraryMasterDB().setSubjectName(value.getLibraryMasterDB().getSubjectMasterDB().getSubjectName());
                   value.getLibraryMasterDB().setSubjectId(value.getLibraryMasterDB().getSubjectMasterDB().getSubjectMasterId());
               }

               // Safely restore any corrupt or erased course names directly from the Master DB into the Enrollment DB before sending the response
               if (value.getMaterialName() == null || value.getMaterialName().isBlank()) {
                   value.setMaterialName(value.getLibraryMasterDB().getMaterialName());
               }
               if (value.getTutorName() == null || value.getTutorName().isBlank()) {
                   if (value.getLibraryMasterDB().getUserInfoDB() != null) {
                       value.setTutorName(value.getLibraryMasterDB().getUserInfoDB().getFullName());
                   }
               }

                //removing child test from libraryMasterDBList
                value.getLibraryMasterDB().setTestDB(null);
                
            }).toList();
                
                responseMap.put("data", materialEnrollmentDBS);
                return ResponseEntity.ok(responseMap);
                
            
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            
            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }
    
    //service layer method to purchase materials
    @Override
    public ResponseEntity<Map<String, Object>> purchaseMaterial(PurchaseMaterialEntity purchaseMaterialEntity) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
                //here fetching enrollment status of the student into the material based on materialId and username.
                Optional<MaterialEnrollmentDB> checkEnrollment = lmsDaoInterf.fetchEnrollmentStatus(purchaseMaterialEntity.getMaterialId(),purchaseMaterialEntity.getUsername());

                //here checking if the student is already enrolled in the material
                if(checkEnrollment.isPresent()){

                    responseMap.put("message", "ALREADY_ENROLLED");
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);

                }else{

                    //here checking if the number of enrollments has exceeded or not
                    Optional<LibraryMasterDB> fetchedLibraryMasterDB = lmsDaoInterf.fetchActiveLibraryMasterById(purchaseMaterialEntity.getMaterialId());
                    
                    //For temporary purpose since payment integration is not done Accepting success for successful payment
                    if(fetchedLibraryMasterDB.isPresent() && Objects.equals(purchaseMaterialEntity.getPaymentStatus().trim().toUpperCase(),"SUCCESS")){

                        //if the student is not already enrolled, enroll a student in material
                        MaterialEnrollmentDB newMaterialEnrollmentDB = new MaterialEnrollmentDB();

                        //setting data members
                        newMaterialEnrollmentDB.setMaterialId(purchaseMaterialEntity.getMaterialId());
                        newMaterialEnrollmentDB.setUsername(purchaseMaterialEntity.getUsername());
                        newMaterialEnrollmentDB.setMaterialName(fetchedLibraryMasterDB.get().getMaterialName());
                        newMaterialEnrollmentDB.setTutorName(fetchedLibraryMasterDB.get().getUserInfoDB().getFullName());
                        newMaterialEnrollmentDB.setIsActive(Boolean.TRUE);
                        newMaterialEnrollmentDB.setIsCompleted(Boolean.FALSE);
                        newMaterialEnrollmentDB.setLibraryMasterDB(fetchedLibraryMasterDB.get());
                        
                        //whose who is a column
                        newMaterialEnrollmentDB.setCreatedBy(purchaseMaterialEntity.getCreatedBy());
                        newMaterialEnrollmentDB.setCreationTimeStamp(LocalDateTime.now());
                        newMaterialEnrollmentDB.setUpdatedBy(purchaseMaterialEntity.getUpdatedBy());
                        newMaterialEnrollmentDB.setUpdationTimeStamp(LocalDateTime.now());

                       List<EnrolledChaptersDB> enrolledDBList =  fetchedLibraryMasterDB.get().getChaptersDBList().stream().map(enrolledLib -> new EnrolledChaptersDB(null, enrolledLib.getChapterId(), enrolledLib.getChapterName(), purchaseMaterialEntity.getUsername(), Boolean.FALSE,newMaterialEnrollmentDB, Boolean.TRUE)).toList();
                       
                       newMaterialEnrollmentDB.setEnrolledChaptersDBList(enrolledDBList);
                        
                        //saving the new enrollment details in materialEnrollment Table
                        Boolean isSave = lmsDaoInterf.saveMaterialEnrollment(newMaterialEnrollmentDB);
                        if(isSave){
                            
                                responseMap.put("message", "material purchased successfully");
                                responseMap.put("status", Boolean.TRUE);
                                return ResponseEntity.ok(responseMap);
                         
                        }else{

                            responseMap.put("message","Error while purchasing material");
                            responseMap.put("status",Boolean.FALSE);
                            return ResponseEntity.badRequest().body(responseMap);
                        }
                    }else{
                        //handling failure payment
                        responseMap.put("message","Payment failed");
                        responseMap.put("status",Boolean.FALSE);
                        return ResponseEntity.badRequest().body(responseMap);
                    }

                }

           

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to add or edit quiz details(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> saveQuizDetails(AddQuizEntity addQuizEntity) {

        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching chapter Details based on the chapterId
            Optional <ChaptersDB> chaptersDB = lmsDaoInterf.fetchActiveChapterDetails(addQuizEntity.getChapterId());

            //here checking if the chapter details exist or not
            if (chaptersDB.isPresent()) {

                if (!Objects.isNull(chaptersDB.get().getQuizDB()) && Objects.equals(addQuizEntity.getQuiz().getQuizId(),  chaptersDB.get().getQuizDB().getQuizId())) {

                    //extracting quizDBList from fetched chapter
                    QuizDB existingQuizDB = chaptersDB.get().getQuizDB();

                    //setting data members
                    existingQuizDB.setQuizName(chaptersDB.get().getChapterName().concat("_").concat("quiz"));
                    existingQuizDB.setChaptersDB(chaptersDB.get());//setting reference of parent

                    //updating existing quiz Question List
                    if (!Objects.isNull(addQuizEntity.getQuiz().getQuizQuestionsDBList()) && !addQuizEntity.getQuiz().getQuizQuestionsDBList().isEmpty()) {

                        List <QuizQuestionsDB> quizQuestionsDBList = existingQuizDB.getQuizQuestionsDBList();

                        addQuizEntity.getQuiz().getQuizQuestionsDBList().forEach(addQuizQuestionsDB -> {

                            //filtering out the list to keep only the object whose Id is sent by client side
                            Optional <QuizQuestionsDB> existingQuizQuestionDB = quizQuestionsDBList.stream().filter(quizQuestionsDB -> !Objects.isNull(addQuizQuestionsDB.getQuizQuestionId()) && Objects.equals(addQuizQuestionsDB.getQuizQuestionId(), quizQuestionsDB.getQuizQuestionId())).findFirst();

                            if (existingQuizQuestionDB.isPresent()) {

                                int quizQuestionIndex = quizQuestionsDBList.indexOf(existingQuizQuestionDB.get());

                                //setting data members
                                existingQuizQuestionDB.get().setQuestionNo(addQuizQuestionsDB.getQuestionNo());
                                existingQuizQuestionDB.get().setQuestionText(addQuizQuestionsDB.getQuestionText());
                                existingQuizQuestionDB.get().setQuestionType(addQuizQuestionsDB.getQuestionType());
                                existingQuizQuestionDB.get().setQuizDB(existingQuizDB);//setting reference of parent

                                //updating existing quiz Answer List
                                if (!Objects.isNull(addQuizQuestionsDB.getQuizAnswersDBList()) && !addQuizQuestionsDB.getQuizAnswersDBList().isEmpty()) {

                                    List <QuizAnswersDB> quizAnswersDBList = existingQuizQuestionDB.get().getQuizAnswersDBList();

                                    addQuizQuestionsDB.getQuizAnswersDBList().forEach(addQuizAnswerDB -> {

                                        //filtering out the list to keep only the object whose Id is sent by client side
                                        Optional <QuizAnswersDB> existingQuizAnswerDB = quizAnswersDBList.stream().filter(quizAnswersDB -> !Objects.isNull(addQuizAnswerDB.getQuizAnswerId()) && Objects.equals(quizAnswersDB.getQuizAnswerId(), addQuizAnswerDB.getQuizAnswerId())).findFirst();

                                        if (existingQuizAnswerDB.isPresent()) {

                                            int quizAnswerIndex = quizAnswersDBList.indexOf(existingQuizAnswerDB.get());

                                            //setting data members
                                            existingQuizAnswerDB.get().setAnswerOption(addQuizAnswerDB.getAnswerOption());
                                            existingQuizAnswerDB.get().setQuizQuestionsDB(existingQuizQuestionDB.get());//setting reference of parent


                                            //setting updated quizAnswerDB in quizAnswerList
                                            quizAnswersDBList.set(quizAnswerIndex, existingQuizAnswerDB.get());

                                        }
                                    });
                                }

                                //setting updated quizQuestionDB in quizQuestionDBList
                                quizQuestionsDBList.set(quizQuestionIndex, existingQuizQuestionDB.get());

                            } else {
                                QuizQuestionsDB newQuizQuestionDb = new QuizQuestionsDB();

                                //setting data members
                                newQuizQuestionDb.setQuestionNo(addQuizQuestionsDB.getQuestionNo());
                                newQuizQuestionDb.setQuestionText(addQuizQuestionsDB.getQuestionText());
                                newQuizQuestionDb.setQuestionType(addQuizQuestionsDB.getQuestionType());
                                newQuizQuestionDb.setQuizDB(existingQuizDB);//setting reference of parent

                                //updating existing quiz Answer List
                                if (!Objects.isNull(addQuizQuestionsDB.getQuizAnswersDBList()) && !addQuizQuestionsDB.getQuizAnswersDBList().isEmpty()) {

                                    ArrayList <QuizAnswersDB> newQuizAnsList = new ArrayList <>();

                                    addQuizQuestionsDB.getQuizAnswersDBList().forEach(addQuizAnswerDB -> {

                                        QuizAnswersDB newQuizAns = new QuizAnswersDB();

                                        //setting data members
                                        newQuizAns.setAnswerOption(addQuizAnswerDB.getAnswerOption());
                                        newQuizAns.setQuizQuestionsDB(newQuizQuestionDb);//setting reference of parent

                                        //whose who is column
                                        newQuizAns.setCreationTimeStamp(LocalDateTime.now());
                                        newQuizAns.setUpdationTimeStamp(LocalDateTime.now());

                                        newQuizAnsList.add(newQuizAns);

                                        newQuizAnsList.trimToSize();

                                        //here setting reference of quizQuestion and quiz answer in quizCorrectAnswerDB whose isCorrect property is true
                                        if (addQuizAnswerDB.getIsCorrect()) {

                                            QuizCorrectAnswersDB newQuizCorrectAnswersDB = new QuizCorrectAnswersDB();
                                            newQuizCorrectAnswersDB.setQuizAnswersDB(newQuizAns);
                                            newQuizCorrectAnswersDB.setQuizQuestionsDB(newQuizQuestionDb);
                                            newQuizQuestionDb.setQuizCorrectAnswersDB(newQuizCorrectAnswersDB);

                                        }
                                    });

                                    newQuizQuestionDb.setQuizAnswersDBList(newQuizAnsList);

                                    quizQuestionsDBList.add(newQuizQuestionDb);
                                }

                            }
                            //setting the reference of newQuizQuestionsDBList in parent newQuizDB object
                            existingQuizDB.setQuizQuestionsDBList(quizQuestionsDBList);

                            chaptersDB.get().setQuizDB(existingQuizDB);//setting reference of child quizDB in parent chaptersDB
                            chaptersDB.get().setLibraryMasterDB(chaptersDB.get().getLibraryMasterDB());

                        });


                    }
                }else {
                        //fetching library master based on materialId
                        Optional <LibraryMasterDB> libraryMasterDB = Optional.ofNullable(chaptersDB.get().getLibraryMasterDB());

                        //incrementing number of assignments by 1
                        libraryMasterDB.ifPresent(value -> value.getMaterialDescDB().setNumberOfAssignments(value.getMaterialDescDB().getNumberOfAssignments() == null ? 1 : value.getMaterialDescDB().getNumberOfAssignments() + 1));

                        //creating new QuizDB object
                        QuizDB newQuizDB = new QuizDB();

                        //setting data members
                        newQuizDB.setQuizName(chaptersDB.get().getChapterName().concat("_").concat("quiz"));
                        newQuizDB.setIsActive(Boolean.TRUE);
                        newQuizDB.setChaptersDB(chaptersDB.get());//setting parent reference

                        //here checking if the getQuizQuestionsDBList is null or empty or not
                        if (!Objects.isNull(addQuizEntity.getQuiz().getQuizQuestionsDBList()) && !addQuizEntity.getQuiz().getQuizQuestionsDBList().isEmpty()) {

                            //adding quiz questions
                            ArrayList <QuizQuestionsDB> newQuizQuestionsDBList = new ArrayList <>();

                            addQuizEntity.getQuiz().getQuizQuestionsDBList().forEach(quizQuestionDB -> {

                                //creating new quizQuestionDB Object
                                QuizQuestionsDB newQuizQuestionDB = new QuizQuestionsDB();

                                //setting data members
                                newQuizQuestionDB.setQuestionNo(quizQuestionDB.getQuestionNo());
                                newQuizQuestionDB.setQuestionType(quizQuestionDB.getQuestionType());
                                newQuizQuestionDB.setQuestionText(quizQuestionDB.getQuestionText());
                                newQuizQuestionDB.setQuizDB(newQuizDB);//setting parent reference

                                //here checking if the getQuizAnswersDBList is null or empty
                                if (!Objects.isNull(quizQuestionDB.getQuizAnswersDBList()) && !quizQuestionDB.getQuizAnswersDBList().isEmpty()) {

                                    //Adding quiz answers
                                    ArrayList <QuizAnswersDB> newQuizAnswersDBList = new ArrayList <>();

                                    quizQuestionDB.getQuizAnswersDBList().forEach(quizAnswersDB -> {

                                        //creating new quizAnswersDB object
                                        QuizAnswersDB newQuizAnswersDB = new QuizAnswersDB();

                                        //setting data members
                                        newQuizAnswersDB.setAnswerOption(quizAnswersDB.getAnswerOption());
                                        newQuizAnswersDB.setQuizQuestionsDB(newQuizQuestionDB);//setting parent reference

                                        //adding the newQuizAnswersDB to newQuizAnswersDBList
                                        newQuizAnswersDBList.add(newQuizAnswersDB);

                                        //here setting reference of quizQuestion and quiz answer in quizCorrectAnswerDB whose isCorrect property is true
                                        if (quizAnswersDB.getIsCorrect()) {

                                            QuizCorrectAnswersDB newQuizCorrectAnswersDB = new QuizCorrectAnswersDB();
                                            newQuizCorrectAnswersDB.setQuizAnswersDB(newQuizAnswersDB);
                                            newQuizQuestionDB.setQuizCorrectAnswersDB(newQuizCorrectAnswersDB);
                                            newQuizCorrectAnswersDB.setQuizQuestionsDB(newQuizQuestionDB);

                                        }

                                    });

                                    //setting the reference of newQuizAnswersDBList in parent newQuizQuestionDB
                                    newQuizQuestionDB.setQuizAnswersDBList(newQuizAnswersDBList);
                                }

                                //Adding the newQuizQuestionDB to newQuizQuestionsDBList
                                newQuizQuestionsDBList.add(newQuizQuestionDB);
                            });

                            //setting the reference of newQuizQuestionsDBList in parent newQuizDB object
                            newQuizDB.setQuizQuestionsDBList(newQuizQuestionsDBList);


                        }

                        chaptersDB.get().setQuizDB(newQuizDB);//setting reference of child quizDB in parent chaptersDB
                        chaptersDB.get().setLibraryMasterDB(libraryMasterDB.orElseGet(() -> chaptersDB.get().getLibraryMasterDB()));
                    }

                    //saving the updated chaptersDB object.
                return saveChapter(responseMap, chaptersDB.get());
                
            }else {

                    //here handling the case where chapter details of the given chapterId is not found
                    responseMap.put("message", "Chapter Details not found for the given chapterId./ chapter is inActive");
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
    
    private ResponseEntity <Map <String, Object>> saveChapter(HashMap <String, Object> responseMap, ChaptersDB chaptersDB){
        try{
            Boolean isChapterSaved = lmsDaoInterf.saveChapterDetails(chaptersDB);
            
            if (isChapterSaved) {
                //here handling successful saving of quiz details
                responseMap.put("message", "Quiz Details saved successfully");
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            } else {
                //here handling unsuccessful saving of quiz details
                responseMap.put("message", "Error while saving Quiz Details");
                responseMap.put("status", Boolean.FALSE);
                return ResponseEntity.badRequest().body(responseMap);
                
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
    
    //save quiz using excel
    @Override
    public ResponseEntity<Map<String, Object>> saveQuizXsl(Long chapterId, Optional<Long> quizId, List<QuizQuestionsDB> quizQuestionsDBList)
    {
        HashMap<String, Object> responseMap = new HashMap<>();
        try{
            //fetching chapter Details based on the chapterId
            Optional <ChaptersDB> chaptersDB = lmsDaoInterf.fetchActiveChapterDetails(chapterId);

            //here checking if the chapter details exist or not
            if (chaptersDB.isPresent()) {


                if (!Objects.isNull(chaptersDB.get().getQuizDB()) && quizId.isPresent() && Objects.equals(chaptersDB.get().getQuizDB().getQuizId(), quizId.get())) {
                    List <QuizQuestionsDB> existingQuizQuestion = chaptersDB.get().getQuizDB().getQuizQuestionsDBList();

                    List <QuizQuestionsDB> newQuizQuestion = quizQuestionsDBList.stream().peek(existingQuizQuestions -> existingQuizQuestions.setQuizDB(chaptersDB.get().getQuizDB())).toList();

                    existingQuizQuestion.addAll(newQuizQuestion);

                    chaptersDB.get().getQuizDB().setQuizQuestionsDBList(existingQuizQuestion);

                } else {
                    QuizDB newQuiz = new QuizDB();

                    List <QuizQuestionsDB> newQuizQuestion = quizQuestionsDBList.stream().peek(existingQuizQuestions -> existingQuizQuestions.setQuizDB(newQuiz)).toList();

                    newQuiz.setQuizName(chaptersDB.get().getChapterName().concat("_").concat("quiz"));
                    newQuiz.setIsActive(Boolean.TRUE);
                    newQuiz.setChaptersDB(chaptersDB.get());
                    newQuiz.setQuizQuestionsDBList(newQuizQuestion);

                    chaptersDB.get().setQuizDB(newQuiz);
                }
                //saving the updated chaptersDB object.
                return saveChapter(responseMap, chaptersDB.get());
                
            }
            else
            {
                //here handling the case where chapter details of the given chapterId is not found
                responseMap.put("message", "Chapter Details not found for the given chapterId./ chapter is inActive");
                responseMap.put("status", Boolean.FALSE);
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

    //edit quiz API as a frontend team needed facing issue in sending the whole object
    @Override
    public ResponseEntity<Map<String, Object>> editQuestion(QuizQuestionsDB quizQuestionsDB)
    {
        HashMap<String, Object> responseMap = new HashMap<>();
        try{
            Optional <QuizQuestionsDB> existingQuizQuestion = lmsDaoInterf.fetchQuizQuestions(quizQuestionsDB.getQuizQuestionId());

            if (existingQuizQuestion.isPresent()) {

                existingQuizQuestion.get().setQuestionText(quizQuestionsDB.getQuestionText());

                if (!Objects.isNull(quizQuestionsDB.getQuizAnswersDBList()) && !quizQuestionsDB.getQuizAnswersDBList().isEmpty()) {

                    //extracting a list of answer object from db
                    List <QuizAnswersDB> quizAnswersDBList = existingQuizQuestion.get().getQuizAnswersDBList();

                    quizQuestionsDB.getQuizAnswersDBList().forEach(quizAnswersDB -> {

                        //checking if an object is present or not based on quizAnswerId
                        Optional<QuizAnswersDB> existingQuizAnswer = quizAnswersDBList.stream().filter(quizAnswersDB1 -> !Objects.isNull(quizAnswersDB.getQuizAnswerId()) && Objects.equals(quizAnswersDB.getQuizAnswerId(), quizAnswersDB1.getQuizAnswerId())).findFirst();

                        if(existingQuizAnswer.isPresent())
                        {
                            //extracting index
                            int index = quizAnswersDBList.indexOf(existingQuizAnswer.get());

                            existingQuizAnswer.get().setAnswerOption(quizAnswersDB.getAnswerOption());
                            existingQuizAnswer.get().setIsCorrect(quizAnswersDB.getIsCorrect());

                            //setting reference
                            existingQuizAnswer.get().setQuizQuestionsDB(existingQuizQuestion.get());

                            //checking a correct answer object exist or not
                            if(quizAnswersDB.getIsCorrect()) {

                                //extracting QuizCorrectAnswersDB object from existingQuizQuestion
                                QuizCorrectAnswersDB quizCorrectAnswersDB = existingQuizQuestion.get().getQuizCorrectAnswersDB();

                                //setting reference
                                quizCorrectAnswersDB.setQuizAnswersDB(existingQuizAnswer.get());
                                quizCorrectAnswersDB.setQuizQuestionsDB(existingQuizQuestion.get());
                                existingQuizQuestion.get().setQuizCorrectAnswersDB(quizCorrectAnswersDB);

                            }

                            //updating the object in a list
                            quizAnswersDBList.set(index, existingQuizAnswer.get());
                        }

                        else
                        {
                            //creating a new QuizAnswersDB object
                            QuizAnswersDB newQuizAnswer = new QuizAnswersDB();

                            //setting data members
                            newQuizAnswer.setAnswerOption(quizAnswersDB.getAnswerOption());
                            newQuizAnswer.setIsCorrect(quizAnswersDB.getIsCorrect());

                            //setting reference
                            newQuizAnswer.setQuizQuestionsDB(existingQuizQuestion.get());

                            //checking a correct answer object exist or not
                            if(quizAnswersDB.getIsCorrect()) {

                                //extracting QuizCorrectAnswersDB object from existingQuizQuestion
                                QuizCorrectAnswersDB quizCorrectAnswersDB = existingQuizQuestion.get().getQuizCorrectAnswersDB();

                                //setting reference
                                quizCorrectAnswersDB.setQuizAnswersDB(newQuizAnswer);
                                quizCorrectAnswersDB.setQuizQuestionsDB(existingQuizQuestion.get());
                                existingQuizQuestion.get().setQuizCorrectAnswersDB(quizCorrectAnswersDB);

                            }

                            //adding an object in a list
                            quizAnswersDBList.add(newQuizAnswer);
                        }
                    });

                    //setting an object
                    existingQuizQuestion.get().setQuizAnswersDBList(quizAnswersDBList);
                }

                Boolean isSave = lmsDaoInterf.updateQuizQuestions(existingQuizQuestion.get());

                if(isSave)
                {
                    responseMap.put("status", Boolean.TRUE);
                    responseMap.put("message", "updated successfully");

                    return ResponseEntity.ok(responseMap);
                }

                else
                {
                    responseMap.put("status", Boolean.FALSE);
                    responseMap.put("message", "updated unsuccessfully");

                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }
            }
            else
            {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "object not found");

                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

        }

        catch(Exception e){
            logger.error(e.fillInStackTrace());
            logger.error(e);


            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to add/edit content in a chapter(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> saveContentDetails(MultipartFile binaryFile,Long chapterId, Optional<Long> contentId){
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching chapter Details based on the chapterId
            Optional<ChaptersDB> chaptersDB = lmsDaoInterf.fetchActiveChapterDetails(chapterId);

            //here checking if the chapter details exists or not
            if (chaptersDB.isPresent()) {

                List<ContentsDB> contentsDBList = chaptersDB.get().getContentsDBList();

                Optional<ContentsDB> existingContentsDB = contentsDBList.stream().filter(contentsDB -> contentId.isPresent() && Objects.equals(contentsDB.getContentId(), contentId.get())).findFirst();

                if (existingContentsDB.isPresent()) {

                    int index = contentsDBList.indexOf(existingContentsDB.get());

                    //setting data members
                    existingContentsDB.get().setContentType(Objects.equals(Objects.requireNonNull(binaryFile.getContentType()).trim().toLowerCase(), "video/mp4".trim().toLowerCase()) ? Content.VIDEO : Content.PDF);
                    existingContentsDB.get().setContent(binaryFile.getBytes());
                    existingContentsDB.get().setIsActive(Boolean.TRUE);
                    existingContentsDB.get().setContentName(binaryFile.getOriginalFilename());
                    existingContentsDB.get().setChaptersDB(chaptersDB.get());//setting reference of parent

                    contentsDBList.set(index, existingContentsDB.get());

                } else {

                    //fetching library master based on materialId
                    Optional<LibraryMasterDB> libraryMasterDB = Optional.ofNullable(chaptersDB.get().getLibraryMasterDB());

                    //incrementing number of assignments by 1
                    libraryMasterDB.ifPresent(value -> value.getMaterialDescDB().setDownloadableResources(value.getMaterialDescDB().getDownloadableResources() == null ? 1 : value.getMaterialDescDB().getDownloadableResources() + 1));

                    //Creating new content object
                    ContentsDB newContentDB = new ContentsDB();

                    //setting data members
                    newContentDB.setContentType(Objects.equals(Objects.requireNonNull(binaryFile.getContentType()).trim().toLowerCase(), "video/mp4".trim().toLowerCase()) ? Content.VIDEO : Content.PDF);
                    newContentDB.setContent(binaryFile.getBytes());
                    newContentDB.setContentName(binaryFile.getOriginalFilename());
                    newContentDB.setIsActive(Boolean.TRUE);
                    newContentDB.setChaptersDB(chaptersDB.get());//setting reference of parent

                    //Adding new content Object in a list
                    contentsDBList.add(newContentDB);
                    chaptersDB.get().setLibraryMasterDB(libraryMasterDB.orElseGet(() -> chaptersDB.get().getLibraryMasterDB()));
                }

                Boolean isChapterSaved = lmsDaoInterf.saveChapterDetails(chaptersDB.get());

                if(isChapterSaved){

                    responseMap.put("message", "Content Added successfully");
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);
                }else{

                    responseMap.put("message", "Error while adding content");
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);
                }

            }else{

                //here handling the case where chapter details of the given chapterId is not found
                responseMap.put("message","Chapter Details not found for the given chapterId./chapter is inActive");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    //service layer method to add or edit chapters in a material(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> saveChapterDetails(AddChapterEntity addChapterEntity) {
       HashMap<String,Object> responseMap = new HashMap<>();

       try{
           //fetching material details from library master based on materialId
           Optional<LibraryMasterDB> libraryMasterDB = lmsDaoInterf.fetchActiveLibraryMasterById(addChapterEntity.getMaterialId());

           //here checking if the material is present in DB or not
           if(libraryMasterDB.isPresent()) {

               if (!Objects.isNull(addChapterEntity.getChapters()) && !addChapterEntity.getChapters().isEmpty()) {

                   //extracting a list of chapters from materials
                   List<ChaptersDB> chaptersDBList = libraryMasterDB.get().getChaptersDBList();

                   //Iterating over a list of chapters
                   addChapterEntity.getChapters().forEach(addChapterDB -> {

                       //filtering out the list to keep only the object whose I'd is sent by client side
                       Optional<ChaptersDB> existingChaptersDB = chaptersDBList.stream().filter(chaptersDB -> !Objects.isNull(addChapterDB.getChapterId()) && Objects.equals(chaptersDB.getChapterId(), addChapterDB.getChapterId())).findFirst();

                       if (existingChaptersDB.isPresent()) {

                           int index = chaptersDBList.indexOf(existingChaptersDB.get());

                           //setting data members
                           existingChaptersDB.get().setChapterName(addChapterDB.getChapterName());
                           existingChaptersDB.get().setChapterCode(addChapterDB.getChapterCode());
                           if(!Objects.isNull(addChapterEntity.getChapters().getFirst().getIsActive()))
                               existingChaptersDB.get().setIsActive(addChapterEntity.getChapters().getFirst().getIsActive());
                           else
                               existingChaptersDB.get().setIsActive(Boolean.TRUE);
                           existingChaptersDB.get().setUpdationTimeStamp(LocalDateTime.now());
                           existingChaptersDB.get().setLibraryMasterDB(libraryMasterDB.get());//setting reference of parent

                           chaptersDBList.set(index, existingChaptersDB.get());

                       } else {

                           //creating new chapters an object
                           ChaptersDB newChaptersDB = new ChaptersDB();

                           //setting data members
                           newChaptersDB.setChapterCode(addChapterDB.getChapterCode());
                           newChaptersDB.setChapterName(addChapterDB.getChapterName());
                           newChaptersDB.setCreationTimeStamp(LocalDateTime.now());
                           newChaptersDB.setLibraryMasterDB(libraryMasterDB.get());//setting reference of parent
                           newChaptersDB.setIsActive(Boolean.TRUE);

                           //Adding new chapters object in a list
                           chaptersDBList.add(newChaptersDB);

                           //incrementing the numbers of chapters by 1
                           if(!Objects.isNull(libraryMasterDB.get().getMaterialDescDB())){
                               libraryMasterDB.get().getMaterialDescDB().setNumberOfChapters(libraryMasterDB.get().getMaterialDescDB().getNumberOfChapters() == null ? 1 : libraryMasterDB.get().getMaterialDescDB().getNumberOfChapters() + 1);
                           }
                       }
                   });

                   //saving the updated LibraryMasterDB object.
                   Boolean isMaterialSaved = lmsDaoInterf.saveMaterialDetails(libraryMasterDB.get());

                   if (isMaterialSaved) {

                       //here handling a case of successful saving of chapters
                       responseMap.put("message", "Chapters Added successfully");
                       responseMap.put("status", Boolean.TRUE);
                       return ResponseEntity.ok(responseMap);

                   } else {

                       //here handling a case of unsuccessful saving of chapters
                       responseMap.put("message", "Error while adding chapters");
                       responseMap.put("status", Boolean.FALSE);
                       return ResponseEntity.badRequest().body(responseMap);
                   }

               } else {

                   //here handling case where chapter details is not found
                   responseMap.put("message", "Chapter Details not found in requestBody");
                   responseMap.put("status", Boolean.FALSE);
                   return ResponseEntity.badRequest().body(responseMap);
               }

           }else{

                //here handling the case where material details is not present for the given id
               responseMap.put("message","Material Details for the given Id is not present in DB/Material is inActive");
               responseMap.put("status",Boolean.FALSE);
               return ResponseEntity.unprocessableEntity().body(responseMap);
           }

       }catch (Exception e){
           logger.catching(e);
           logger.error(e.fillInStackTrace());

           responseMap.put("Exception", e.getMessage());
           return ResponseEntity.internalServerError().body(responseMap);
       }
    }

    //service layer to add or edit material(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> saveMaterialDetails(LibraryMasterDB libraryMasterDB) {
        HashMap<String,Object> responseMap = new HashMap<>();
        Boolean isMaterialSaved;

        try{
            //fetching user details based on tutorId
            Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfoById(libraryMasterDB.getUserInfoDB().getUserDetailsId());

            if(userInfoDB.isPresent()) {

                Optional<LibraryMasterDB> existingLibraryMasterDB = lmsDaoInterf.fetchActiveLibraryMasterById(libraryMasterDB.getMaterialId());

                if(existingLibraryMasterDB.isPresent()){

                     //setting data members of libraryMaster
                    existingLibraryMasterDB.get().setMaterialName(libraryMasterDB.getMaterialName() != null ? libraryMasterDB.getMaterialName() : existingLibraryMasterDB.get().getMaterialName());
                    existingLibraryMasterDB.get().setMaterialCode(libraryMasterDB.getMaterialCode() !=  null ? libraryMasterDB.getMaterialCode() : existingLibraryMasterDB.get().getMaterialCode());
                    existingLibraryMasterDB.get().setMaterialPrice(libraryMasterDB.getMaterialPrice() != null ? libraryMasterDB.getMaterialPrice() : existingLibraryMasterDB.get().getMaterialPrice());
                    existingLibraryMasterDB.get().setDiscountPercentage(libraryMasterDB.getDiscountPercentage() != null ? libraryMasterDB.getDiscountPercentage() : existingLibraryMasterDB.get().getDiscountPercentage());
                    existingLibraryMasterDB.get().setRating(libraryMasterDB.getRating() != null ? libraryMasterDB.getRating() : existingLibraryMasterDB.get().getRating());
                    existingLibraryMasterDB.get().setTotalRatings(libraryMasterDB.getTotalRatings() != null ? libraryMasterDB.getTotalRatings() : existingLibraryMasterDB.get().getTotalRatings());
                    existingLibraryMasterDB.get().setIsCertificationRequired(libraryMasterDB.getIsCertificationRequired() != null ? libraryMasterDB.getIsCertificationRequired() : existingLibraryMasterDB.get().getIsCertificationRequired());
                    existingLibraryMasterDB.get().setIsPublished(
                            libraryMasterDB.getIsPublished() != null
                                    ? libraryMasterDB.getIsPublished()
                                    : (Boolean.TRUE.equals(existingLibraryMasterDB.get().getIsCertificationRequired())
                                        ? Boolean.TRUE
                                        : existingLibraryMasterDB.get().getIsPublished())
                    );
                    existingLibraryMasterDB.get().setIsActive(Boolean.TRUE);
                    existingLibraryMasterDB.get().setUpdatedBy(userInfoDB.get().getUserDetailsId());
                    existingLibraryMasterDB.get().setUpdationTimeStamp(LocalDateTime.now());
                    existingLibraryMasterDB.get().setMaterialImageDB(libraryMasterDB.getMaterialImage() != null ? Base64.getDecoder().decode(libraryMasterDB.getMaterialImage()) : null);
                    existingLibraryMasterDB.get().setSubjectMasterDB(libraryMasterDB.getSubjectMasterDB());
                    existingLibraryMasterDB.get().setUserInfoDB(libraryMasterDB.getUserInfoDB() != null ? libraryMasterDB.getUserInfoDB() : null);
                    
                    //here checking if the materialDescription is present in request body or not
                    if(!Objects.isNull(libraryMasterDB.getMaterialDescDB())){

                        //if materialDescDB is null in DB creating a new object
                        if(Objects.isNull(existingLibraryMasterDB.get().getMaterialDescDB())){

                            MaterialDescDB newMaterialDescDB = new MaterialDescDB();

                            //setting data members
                             newMaterialDescDB.setMaterialBrief(libraryMasterDB.getMaterialDescDB().getMaterialBrief());
                             newMaterialDescDB.setLibraryMasterDB(existingLibraryMasterDB.get());//settting reference of existinglibraryMasterDB in newMaterialDescDB
                             existingLibraryMasterDB.get().setMaterialDescDB(newMaterialDescDB);// setting reference of new materialDescDB in exisitingLibraryMasterDB

                        }else{

                            //setting data members of material description of already existing materialDescDB
                            existingLibraryMasterDB.get().getMaterialDescDB().setMaterialBrief(libraryMasterDB.getMaterialDescDB().getMaterialBrief() != null ? libraryMasterDB.getMaterialDescDB().getMaterialBrief() : existingLibraryMasterDB.get().getMaterialDescDB().getMaterialBrief());
                            existingLibraryMasterDB.get().getMaterialDescDB().setLibraryMasterDB(existingLibraryMasterDB.get());
                        }
                    }

                    //here saving the updated libraryMasterDB object
                    isMaterialSaved = lmsDaoInterf.saveMaterialDetails(existingLibraryMasterDB.get());

                }else{

                    //creating new libraryMaster Object
                    LibraryMasterDB newLibraryMasterDB = new LibraryMasterDB();

                    //setting data members of libraryMaster
                    newLibraryMasterDB.setMaterialName(libraryMasterDB.getMaterialName());
                    newLibraryMasterDB.setMaterialCode(libraryMasterDB.getMaterialCode());
                    newLibraryMasterDB.setMaterialPrice(libraryMasterDB.getMaterialPrice() == null ? 0.0 : libraryMasterDB.getMaterialPrice());
                    newLibraryMasterDB.setDiscountPercentage(libraryMasterDB.getDiscountPercentage() == null ? 0.0 : libraryMasterDB.getDiscountPercentage());
                    newLibraryMasterDB.setRating(libraryMasterDB.getRating());
                    newLibraryMasterDB.setTotalRatings(libraryMasterDB.getTotalRatings());
                    newLibraryMasterDB.setIsCertificationRequired(libraryMasterDB.getIsCertificationRequired());
                    newLibraryMasterDB.setIsPublished(
                            libraryMasterDB.getIsPublished() != null
                                    ? libraryMasterDB.getIsPublished()
                                    : Boolean.TRUE.equals(libraryMasterDB.getIsCertificationRequired())
                    );
                    newLibraryMasterDB.setIsActive(Boolean.TRUE);
                    newLibraryMasterDB.setCreatedBy(userInfoDB.get().getUserDetailsId());
                    newLibraryMasterDB.setMaterialImageDB(libraryMasterDB.getMaterialImage() != null ? Base64.getDecoder().decode(libraryMasterDB.getMaterialImage()) : null);
                    newLibraryMasterDB.setSubjectMasterDB(libraryMasterDB.getSubjectMasterDB());
                    newLibraryMasterDB.setUserInfoDB(libraryMasterDB.getUserInfoDB());
                    
                    //here checking if the materialDescription is present in request body or not
                    if(!Objects.isNull(libraryMasterDB.getMaterialDescDB())){

                        //Creating new object of materialDescriptionDB
                        MaterialDescDB newMaterialDescDB = new MaterialDescDB();

                        //setting data members of material description
                        newMaterialDescDB.setMaterialBrief(libraryMasterDB.getMaterialDescDB().getMaterialBrief());
                        newMaterialDescDB.setLibraryMasterDB(newLibraryMasterDB);//setting reference of parent

                        newLibraryMasterDB.setMaterialDescDB(newMaterialDescDB);
                    }

                    //here saving new libraryMasterDB
                    isMaterialSaved = lmsDaoInterf.saveMaterialDetails(newLibraryMasterDB);

                }

                //here checking if material is saved successfully or not
                if (isMaterialSaved) {

                    //here handling successful saving of material
                    responseMap.put("message", "Material saved successfully");
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);

                } else {
                    //here handling error if material fails to save
                    responseMap.put("message", "Error While adding material");
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }

            }else{
                //here handling the case where tutorId is not found in DB
                responseMap.put("message","Tutor Id provided is not present in DB");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.badRequest().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to fetchOtherMaterialsByTutor
    @Override
    public ResponseEntity<Map<String, Object>> fetchOtherMaterialsByTutor(Long tutorId, Long materialId, String username, Optional<Boolean> isCompleted) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching List of Library Master
            List<LibraryMasterDB> libraryMasterDBList = lmsDaoInterf.fetchLibraryMaster().orElseGet(Collections:: emptyList);

            //fetching list of enrolled materialIds.
            List<MaterialEnrollmentDB> materialEnrollments = lmsDaoInterf.fetchEnrolledMaterials(username, isCompleted).orElseGet(Collections::emptyList);

            //collect the set of materialIds from materialEnrollments
            Set<Long> materialEnrollmentsIds = materialEnrollments.stream()
                    .map(MaterialEnrollmentDB::getMaterialId)
                    .collect(Collectors.toSet());

            //here checking if the libraryMasterDBList is empty or not
            if(!libraryMasterDBList.isEmpty()){

                //filtering out libraryMasterDB objects whose IDs are present in enrolledMaterials and sorting the remaining ones
                libraryMasterDBList.removeIf(libraryMasterDB -> materialEnrollmentsIds.contains(libraryMasterDB.getMaterialId()));

                // Calculate the discounted price for each item in libraryMasterDBList
                libraryMasterDBList.forEach(libraryMasterDB -> {
                    double discountedPrice = calculateDiscountedPrice(libraryMasterDB.getMaterialPrice(), libraryMasterDB.getDiscountPercentage());
                    libraryMasterDB.setDiscountedPrice(discountedPrice);
                });

                responseMap.put("data",libraryMasterDBList);
                return ResponseEntity.ok(responseMap);

            }else {
                responseMap.put("data",libraryMasterDBList);
                return ResponseEntity.badRequest().body(responseMap);
            }

        }catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to toggleMaterialActiveStatus(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> toggleMaterialActiveStatus(Long materialId, Boolean status) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            Optional<LibraryMasterDB> fetchedLibraryMasterDB = lmsDaoInterf.fetchAllLibraryMasterById(materialId);

            if(fetchedLibraryMasterDB.isPresent()){

                //setting active Status
                fetchedLibraryMasterDB.get().setIsActive(status);

                Boolean isMaterialSaved = lmsDaoInterf.saveMaterialDetails(fetchedLibraryMasterDB.get());

                if(isMaterialSaved){

                    responseMap.put("message","Active Status toggled successfully");
                    responseMap.put("status",Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);

                }else{

                    responseMap.put("message","Error while toggling Active status of the material");
                    responseMap.put("status",Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);

                }

            }else{

                //here handling the case of material not found for the provided materialId
                responseMap.put("message","material with the given ID doesn't exist in DB");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to toggleChapterActiveStatus(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> toggleChapterActiveStatus(Long chapterId, Boolean status) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            Optional<ChaptersDB> fetchedChaptersDB = lmsDaoInterf.fetchAllChapterDetails(chapterId);

            if(fetchedChaptersDB.isPresent()){

                //setting active Status
                fetchedChaptersDB.get().setIsActive(status);

                Boolean isChapterSaved = lmsDaoInterf.saveChapterDetails(fetchedChaptersDB.get());

                if(isChapterSaved){

                    responseMap.put("message","Active Status toggled successfully");
                    responseMap.put("status",Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);

                }else{

                    responseMap.put("message","Error while toggling Active status of the chapter");
                    responseMap.put("status",Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);

                }

            }else{
                //here handling the case of chapter not found for the provided chapterId
                responseMap.put("message","chapter with the given ID doesn't exist in DB");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to toggleQuizActiveStatus(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> toggleQuizActiveStatus(Long quizId, Boolean status) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            Optional<QuizDB> fetchedQuizDB = lmsDaoInterf.fetchAllQuizDetails(quizId);

            if(fetchedQuizDB.isPresent()){

                //setting active Status
                fetchedQuizDB.get().setIsActive(status);

                Boolean isChapterSaved = lmsDaoInterf.saveQuizDetails(fetchedQuizDB.get());

                if(isChapterSaved){

                    responseMap.put("message","Active Status toggled successfully");
                    responseMap.put("status",Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);

                }else{

                    responseMap.put("message","Error while toggling Active status of the Quiz");
                    responseMap.put("status",Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);

                }

            }else{
                //here handling the case of Quiz not found for the provided quizId
                responseMap.put("message","Quiz with the given ID doesn't exist in DB");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }


    //service layer method to fetch all courses details(admin side)
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchAllCourses(int page, int size) {
        HashMap<String,Object> responseMap = new HashMap<>();

        try{
            Pageable pageable = PageRequest.of(page,size);

            //fetching all courses details
            Page<LibraryMasterDB> libraryMasterDBPage = lmsDaoInterf.fetchAllCourses(pageable).orElseGet(Page::empty);

            List<LibraryMasterDB> libraryMasterDBList = libraryMasterDBPage.getContent().stream()
                    .map(libraryMasterDB -> buildCourseSummary(libraryMasterDB, false, false, false))
                    .toList();


            if(!libraryMasterDBList.isEmpty()){

                responseMap.put("data",libraryMasterDBList);
                responseMap.put("currentPage",page);
                responseMap.put("pageSize",size);
                responseMap.put("totalPages",libraryMasterDBPage.getTotalPages());
                return ResponseEntity.ok(responseMap);

            }else{

                responseMap.put("data",libraryMasterDBList);
                responseMap.put("currentPage",page);
                responseMap.put("pageSize",size);
                responseMap.put("totalPages",0);
                return ResponseEntity.ok(responseMap);

            }
        }catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to serve contents in a chapter to client
    @Override
    public ResponseEntity<ContentsDB> serveContentInChapter(Long contentId, HttpHeaders headers) {

        try {
            // Fetching content details from the database
            Optional<ContentsDB> fetchedContentsDB = lmsDaoInterf.fetchActiveContentDetails(contentId);

            if(fetchedContentsDB.isPresent()) {
                ContentsDB contentsDB = fetchedContentsDB.get();

                return ResponseEntity.ok(contentsDB);
            }else {
                return ResponseEntity.badRequest().build();
            }
            //                byte[] contentData = contentsDB.getContent();
            //                String contentType;
            //                long contentLength = contentData.length;
            //
            //                // Determine content type
            //                if (contentsDB.getContentType() == Content.PDF) {
            //                    contentType = "application/pdf";
            //                } else if (contentsDB.getContentType() == Content.VIDEO) {
            //                    contentType = "video/mp4";
            //                } else {
            //                    contentType = "application/octet-stream";
            //                }
            //                List<HttpRange> ranges = headers.getRange();
            //                if (ranges.isEmpty()) {
            //                    // Return full file if no range is requested
            ////                    return ResponseEntity.ok()
            ////                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + contentId + "\"")
            ////                            .header(HttpHeaders.CONTENT_TYPE, contentType)
            ////                            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
            ////                            .body(new ByteArrayResource(contentData));
            //                } else {
            //                    // Return partial content if range is requested
            //                    HttpRange range = ranges.getFirst();
            //                    long start = range.getRangeStart(contentLength);
            //                    long end = range.getRangeEnd(contentLength);
            //                    long rangeLength = end - start + 1;
            //
            //                    byte[] partialContentData = new byte[(int) rangeLength];
            //                    System.arraycopy(contentData, (int) start, partialContentData, 0, (int) rangeLength);
            //
            ////                    return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
            ////                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + contentId + "\"")
            ////                            .header(HttpHeaders.CONTENT_TYPE, contentType)
            ////                            .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + contentLength)
            ////                            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(rangeLength))
            ////                            .body(new ByteArrayResource(partialContentData));
            //
            //
            //                }
            // Return a 404 status if the content is not found
        } catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            throw new RuntimeException("File serving error", e);
        }
    }

    //service layer method to fetch courses for student dashboard
    @Override
    public ResponseEntity<Map<String, Object>> getDashBoardCourses(String username, Optional<Boolean> isCompleted, Optional<Long> batchId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            List<MaterialEnrollmentDB> classroomMaterials = new ArrayList<>();
            List<MaterialEnrollmentDB> certificationCourses = new ArrayList<>();

            // Fetch batch courses if batchId is provided
            if (batchId.isPresent() && batchId.get() != null) {
                List<BatchCourseRelationEntity> batchCourses = lmsDaoInterf.fetchBatchCourses(batchId.get()).orElseGet(Collections::emptyList);
                
                // Convert batch courses to MaterialEnrollmentDB-like objects
                for (BatchCourseRelationEntity batchCourse : batchCourses) {
                    Optional<LibraryMasterDB> libraryMasterDB = lmsDaoInterf.fetchAllLibraryMasterById(batchCourse.getCourseId());
                    
                    if (libraryMasterDB.isPresent()) {
                        MaterialEnrollmentDB enrollment = new MaterialEnrollmentDB();
                        LibraryMasterDB material = libraryMasterDB.get();
                        
                        enrollment.setMaterialId(material.getMaterialId());
                        enrollment.setMaterialName(material.getMaterialName());
                        enrollment.setTutorName(
                                !Objects.isNull(material.getUserInfoDB())
                                        ? material.getUserInfoDB().getFullName()
                                        : "Unknown Tutor"
                        );
                        enrollment.setIsActive(Boolean.TRUE);
                        enrollment.setIsCompleted(Boolean.FALSE);
                        enrollment.setLibraryMasterDB(material);
                        enrollment.setUsername(username);
                        
                        // Process the material
                        double discountedPrice = calculateDiscountedPrice(material.getMaterialPrice(), material.getDiscountPercentage());
                        material.setDiscountedPrice(discountedPrice);

                        if(!Objects.isNull(material.getSubjectMasterDB())) {
                            material.setSubjectName(material.getSubjectMasterDB().getSubjectName());
                            material.setSubjectId(material.getSubjectMasterDB().getSubjectMasterId());
                        }

                        material.setTestDB(null);
                        
                        classroomMaterials.add(enrollment);
                    }
                }
            }

            // Fetch individual material enrollments (skill programs)
            List<MaterialEnrollmentDB> materialEnrollments = lmsDaoInterf.fetchEnrolledMaterials(username, isCompleted).orElseGet(Collections::emptyList);

            // Calculate the discounted price for each item
            materialEnrollments.forEach(materialEnrollmentDB -> {
                double discountedPrice = calculateDiscountedPrice(materialEnrollmentDB.getLibraryMasterDB().getMaterialPrice(), materialEnrollmentDB.getLibraryMasterDB().getDiscountPercentage());
                materialEnrollmentDB.getLibraryMasterDB().setDiscountedPrice(discountedPrice);

                if(!Objects.isNull(materialEnrollmentDB.getLibraryMasterDB().getSubjectMasterDB())) {
                    materialEnrollmentDB.getLibraryMasterDB().setSubjectName(materialEnrollmentDB.getLibraryMasterDB().getSubjectMasterDB().getSubjectName());
                    materialEnrollmentDB.getLibraryMasterDB().setSubjectId(materialEnrollmentDB.getLibraryMasterDB().getSubjectMasterDB().getSubjectMasterId());
                }

                materialEnrollmentDB.getLibraryMasterDB().setTestDB(null);
            });

            // Separate individual enrollments into skill programs (certification) and any remaining classroom materials
            Map<Boolean, List<MaterialEnrollmentDB>> materialsByCertification = materialEnrollments.stream()
                    .collect(Collectors.partitioningBy(materialEnrollments1 -> Boolean.TRUE.equals(materialEnrollments1.getLibraryMasterDB().getIsCertificationRequired())));

            certificationCourses = materialsByCertification.getOrDefault(true, new ArrayList<>());
            
            // Add non-certification materials to classroom if no batch courses exist
            if (classroomMaterials.isEmpty()) {
                classroomMaterials.addAll(materialsByCertification.getOrDefault(false, new ArrayList<>()));
            }

            responseMap.put("certificationCourses", certificationCourses);
            responseMap.put("classroomMaterials", classroomMaterials);

            return ResponseEntity.ok(responseMap);

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to fetch materials based on Id
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getCourseMaterialById(Long materialId) {
        HashMap<String,Object> responseMap = new HashMap<>();

        try{
            Optional<LibraryMasterDB> libraryMasterDB = lmsDaoInterf.fetchAllLibraryMasterById(materialId);

            if(libraryMasterDB.isPresent()){
                responseMap.put("data",buildCourseSummary(libraryMasterDB.get(), true, true, false));
                return ResponseEntity.ok(responseMap);
            }else{
                responseMap.put("data", new HashMap<>());
                responseMap.put("message","material with the ID doesn't exist in DB");
                return ResponseEntity.ok(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());

            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to publish course to student(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> publishCourseToStudents(Long materialId) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching course based on materialId
            Optional<LibraryMasterDB> libraryMasterDB = lmsDaoInterf.fetchActiveLibraryMasterById(materialId);

            //here checking if the material exists in DB
            if(libraryMasterDB.isPresent()) {

                Boolean isPublished = libraryMasterDB.get().getIsPublished();
                //here checking if the material is already published to student or not
                if (isPublished != null && isPublished) {
                    responseMap.put("message","material already published to students");
                    responseMap.put("status",Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);
                }

                //Making is published to true
                libraryMasterDB.get().setIsPublished(Boolean.TRUE);

                Boolean isMaterialSaved = lmsDaoInterf.saveMaterialDetails(libraryMasterDB.get());

                if (isMaterialSaved) {

                    //here handling case of successfully save of material
                    responseMap.put("message", "material published to students");
                    responseMap.put("status", Boolean.TRUE);
                    return ResponseEntity.ok(responseMap);
                } else {

                    //here handling case of error in saving material
                    responseMap.put("message", "error while publishing material to students");
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.unprocessableEntity().body(responseMap);
                }
            }else{

                //if the material does not exist in DB
                responseMap.put("message", "material with given ID doesn't exist in DB/is inactive");
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

    // Service layer to fetch chapters list of a course
    @Override
    public ResponseEntity<Map<String, Object>> getChaptersList(Long materialId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{
            Optional<LibraryMasterDB> libraryMasterDB = lmsDaoInterf.fetchActiveLibraryMasterById(materialId);


            if(libraryMasterDB.isPresent()){

                ArrayList<ChaptersDB> chaptersDBList = libraryMasterDB.get().getChaptersDBList().stream().filter(ChaptersDB::getIsActive).collect(Collectors.toCollection(ArrayList ::new));


                List<QuizQuestionsDB> quizQuestionsDBList = chaptersDBList.stream().filter(chaptersDB1 -> !Objects.isNull(chaptersDB1.getQuizDB())).flatMap(chaptersDB -> chaptersDB.getQuizDB().getQuizQuestionsDBList().stream()).toList();

                quizQuestionsDBList.forEach(quizQuestionsDB -> {


                    if(!Objects.isNull(quizQuestionsDB.getQuizCorrectAnswersDB()))
                    {
                        List<QuizAnswersDB> quizCorrectAns = quizQuestionsDB.getQuizAnswersDBList().stream().peek(correctAns -> correctAns.setIsCorrect(Objects.equals(correctAns.getQuizAnswerId(), quizQuestionsDB.getQuizCorrectAnswersDB().getQuizAnswersDB().getQuizAnswerId()))).toList();

                        quizQuestionsDB.setQuizAnswersDBList(quizCorrectAns);

                    }
                });

                chaptersDBList.sort(Comparator.comparing(ChaptersDB :: getChapterId));

                responseMap.put("chaptersList", chaptersDBList);
            }else {
                responseMap.put("chaptersList", Collections.emptyList());
            }
            return ResponseEntity.ok(responseMap);
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    // service layer to fetch all courses for public api
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getAllCourses(int page, int size, Optional<Long> subjectId) {

        HashMap<String, Object> responseMap = new HashMap<>();

        try{

            Pageable pageable = PageRequest.of(page, size);

            Page<LibraryMasterDB> allCoursesPages = lmsDaoInterf.getAllCourses(pageable, subjectId).orElseGet(Page::empty);

            //fetching list of webinarInfo
            List<LibraryMasterDB> allCourses = allCoursesPages.getContent().stream()
                    .filter(LibraryMasterDB::getIsActive)
                    .map(libraryMasterDB -> buildCourseSummary(libraryMasterDB, false, false, true))
                    .toList();

            if(!allCourses.isEmpty()){
                Map<Boolean, List<LibraryMasterDB>> materialsByCertification = allCourses.stream()
                        .collect(Collectors.partitioningBy(LibraryMasterDB::getIsCertificationRequired));

                List<LibraryMasterDB> certificationMaterials = materialsByCertification.get(true);
                List<LibraryMasterDB> classroomMaterials = materialsByCertification.get(false);

                responseMap.put("certificationCourses", certificationMaterials);
                responseMap.put("classroomMaterials", classroomMaterials);

                return ResponseEntity.ok(responseMap);
            }else{
                return ResponseEntity.noContent().build();
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    // Service layer to delete quiz question
    @Override
    public ResponseEntity<Boolean> deleteQuizQuestion(Long questionId) {
        try{
            Boolean isDeleted = lmsDaoInterf.deleteQuizQuestion(questionId);

            if (isDeleted)
                return ResponseEntity.ok(Boolean.TRUE);
            else
                return ResponseEntity.badRequest().body(Boolean.FALSE);
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            return ResponseEntity.internalServerError().body(Boolean.FALSE);
        }
    }

}
