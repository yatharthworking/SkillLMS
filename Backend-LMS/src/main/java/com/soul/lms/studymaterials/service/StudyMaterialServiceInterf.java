package com.soul.lms.studymaterials.service;

import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import com.soul.lms.model.entity.studymaterial.*;
import com.soul.lms.model.entity.studymaterial.quiz.AddQuizEntity;
import com.soul.lms.model.entity.studymaterial.quiz.QuizQuestionsDB;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface StudyMaterialServiceInterf {

    ResponseEntity<Map<String, Object>> getLibraryMaster(String username, Optional<Boolean> isCompleted);
    
    ResponseEntity<List<MaterialEnrollmentDB>> getInProgressMaterials(String username, Optional<Boolean> isCompleted);

    ResponseEntity<Map<String ,Object>> submitQuiz(List<Long> questionIds);

    ResponseEntity<Map<String,Object>> markAsCompleteChapter(EnrolledChaptersDB completedChaptersDB);
    
    ResponseEntity<Map<String, Object>> getCompletedMaterials(String userName, Optional<Boolean> isCompleted);

    ResponseEntity<Map<String ,Object>> purchaseMaterial(PurchaseMaterialEntity purchaseMaterialEntity);

    ResponseEntity<Map<String ,Object>> saveQuizDetails(AddQuizEntity addQuizEntity);
    
    ResponseEntity<Map<String, Object>> saveQuizXsl(Long chapterId, Optional<Long> quizId, List<QuizQuestionsDB> quizQuestionsDBList);
    
    ResponseEntity<Map<String, Object>> editQuestion(QuizQuestionsDB quizQuestionsDB);
    
    ResponseEntity<Map<String, Object>> saveContentDetails(MultipartFile binaryFile,Long chapterId, Optional<Long> contentId) throws IOException;
    
    ResponseEntity<Map<String ,Object>> saveChapterDetails(AddChapterEntity addChapterEntity);

    ResponseEntity<Map<String,Object>> saveMaterialDetails(LibraryMasterDB libraryMasterDB);

    ResponseEntity<Map<String ,Object>> fetchOtherMaterialsByTutor(Long tutorId, Long materialId,String username, Optional<Boolean> isCompleted);

    ResponseEntity<Map<String,Object>> toggleMaterialActiveStatus(Long materialId,Boolean status);

    ResponseEntity<Map<String,Object>> toggleChapterActiveStatus(Long chapterId,Boolean status);

    ResponseEntity<Map<String,Object>> toggleQuizActiveStatus(Long quizId,Boolean status);

    ResponseEntity<Map<String ,Object>> fetchAllCourses(int page, int size);

    ResponseEntity<ContentsDB> serveContentInChapter(Long contentId, HttpHeaders headers);

    ResponseEntity<Map<String, Object>> getDashBoardCourses(String username, Optional<Boolean> isCompleted, Optional<Long> batchId);
    
    ResponseEntity<Map<String, Object>> markAsCompleteMaterial(MaterialEnrollmentDB materialEnrollmentDB);
    
    ResponseEntity<Map<String ,Object>> getCourseMaterialById(Long materialId);

    ResponseEntity<Map<String ,Object>> publishCourseToStudents(Long materialId);

    ResponseEntity<Map<String, Object>> getChaptersList(Long materialId);

    ResponseEntity<Map<String, Object>> getAllCourses(int page, int size, Optional<Long> subjectId);

    ResponseEntity<Boolean> deleteQuizQuestion(Long questionId);
}
