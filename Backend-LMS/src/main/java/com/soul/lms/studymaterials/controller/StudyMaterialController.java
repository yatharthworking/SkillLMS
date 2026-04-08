package com.soul.lms.studymaterials.controller;

import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import com.soul.lms.model.entity.studymaterial.EnrolledChaptersDB;
import com.soul.lms.model.entity.studymaterial.MaterialEnrollmentDB;
import com.soul.lms.model.entity.studymaterial.PurchaseMaterialEntity;
import com.soul.lms.studymaterials.service.StudyMaterialServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/studyMaterial")
@CrossOrigin
public class StudyMaterialController{
	
	private final StudyMaterialServiceInterf studyMaterialServiceInterf;
	
	@Autowired
	public StudyMaterialController(StudyMaterialServiceInterf studyMaterialServiceInterf){
		super();
		this.studyMaterialServiceInterf = studyMaterialServiceInterf;
	}
	
	//GET API TO fetch materials in a library
	@GetMapping("/getLibraryMaster")
	public ResponseEntity <Map <String, Object>> getLibraryMaster(@RequestParam String username, @RequestParam(required = false) Boolean isCompleted){
		return studyMaterialServiceInterf.getLibraryMaster(username, isCompleted != null ? Optional.of(isCompleted) : Optional.empty());
	}
	
	//GET API to fetch enrolled materials for a student
	@GetMapping("/getInProgressMaterials")
	public ResponseEntity<List<MaterialEnrollmentDB>> getInProgressMaterials(@RequestParam String username, @RequestParam(required = false) Boolean isCompleted){
		return studyMaterialServiceInterf.getInProgressMaterials(username, isCompleted != null ? Optional.of(isCompleted) : Optional.empty());
	}
	
	//POST API for submitting quiz
	@PostMapping("/submitQuiz")
	public ResponseEntity <Map <String, Object>> submitQuiz(@RequestBody List <Long> questionIds){
		return studyMaterialServiceInterf.submitQuiz(questionIds);
	}
	
	//PATCH API to "Mark_As_Complete" a chapter
	@PatchMapping("/markAsComplete")
	public ResponseEntity <Map <String, Object>> markAsComplete(@RequestBody EnrolledChaptersDB completedChaptersDB){
		return studyMaterialServiceInterf.markAsCompleteChapter(completedChaptersDB);
	}
	
	//GET API to fetch completed Materials for a student
	@GetMapping("/getCompletedMaterials")
	public ResponseEntity <Map <String, Object>> getCompletedMaterials(@RequestParam String username, @RequestParam(required = false) Boolean isCompleted){
		return studyMaterialServiceInterf.getCompletedMaterials(username, isCompleted != null ? Optional.of(isCompleted) : Optional.empty());
	}
	
	//PATCH API to update material enrollment
	@PatchMapping("/update-material-enrollment")
	public ResponseEntity<Map<String, Object>> updateMaterialEnrollment(@RequestBody MaterialEnrollmentDB materialEnrollmentDB)
	{
		return studyMaterialServiceInterf.markAsCompleteMaterial(materialEnrollmentDB);
	}
	
	//POST API for purchasing material
	@PostMapping("/purchaseMaterial")
	public ResponseEntity <Map <String, Object>> purchaseMaterial(@RequestBody PurchaseMaterialEntity purchaseMaterialEntity){
		return studyMaterialServiceInterf.purchaseMaterial(purchaseMaterialEntity);
	}
	
	//GET API for other materials Offered by tutor
	@GetMapping("/fetchOtherMaterialsByTutor")
	public ResponseEntity <Map <String, Object>> fetchOtherMaterialsByTutor(@RequestParam Long tutorId, @RequestParam Long materialId, @RequestParam String username, @RequestParam(required = false) Boolean isCompleted){
		return studyMaterialServiceInterf.fetchOtherMaterialsByTutor(tutorId, materialId, username, isCompleted != null ? Optional.of(isCompleted) : Optional.empty());
	}
	
	//GET API TO serve File to client
	@GetMapping("/serveContentInChapter")
	public ResponseEntity <ContentsDB> serveContentInChapter(@RequestParam Long contentId, @RequestHeader HttpHeaders headers){
		return studyMaterialServiceInterf.serveContentInChapter(contentId, headers);
	}
	
	// Dash Board Courses separated in two parts, one is certification courses, and the other is classroom Program
	@GetMapping("/getDashBoardCourses")
	public ResponseEntity <Map <String, Object>> getDashBoardCourses(@RequestParam String username, @RequestParam(required = false) Boolean isCompleted, @RequestParam(required = false) Long batchId){
		Optional<Boolean> isCompletedOpt = isCompleted != null ? Optional.of(isCompleted) : Optional.empty();
		Optional<Long> batchIdOpt = batchId != null ? Optional.of(batchId) : Optional.empty();
		return studyMaterialServiceInterf.getDashBoardCourses(username, isCompletedOpt, batchIdOpt);
	}
	
	
}
