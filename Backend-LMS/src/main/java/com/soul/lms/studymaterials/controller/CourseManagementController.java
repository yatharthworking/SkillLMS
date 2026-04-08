package com.soul.lms.studymaterials.controller;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import com.soul.lms.studymaterials.service.StudyMaterialServiceInterf;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/courses", "/skill-programs"})
@CrossOrigin
public class CourseManagementController {

    private final StudyMaterialServiceInterf studyMaterialServiceInterf;
    private final LmsDaoInterf lmsDaoInterf;

    @Autowired
    public CourseManagementController(StudyMaterialServiceInterf studyMaterialServiceInterf, LmsDaoInterf lmsDaoInterf) {
        this.studyMaterialServiceInterf = studyMaterialServiceInterf;
        this.lmsDaoInterf = lmsDaoInterf;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCourse(@RequestBody @Valid LibraryMasterDB libraryMasterDB,
                                                            Authentication authentication,
                                                            HttpServletRequest request) {
        return saveCourse(libraryMasterDB, authentication, request, false);
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<Map<String, Object>> updateCourse(@PathVariable Long courseId,
                                                            @RequestBody @Valid LibraryMasterDB libraryMasterDB,
                                                            Authentication authentication,
                                                            HttpServletRequest request) {
        libraryMasterDB.setMaterialId(courseId);
        return saveCourse(libraryMasterDB, authentication, request, true);
    }

    private ResponseEntity<Map<String, Object>> saveCourse(LibraryMasterDB libraryMasterDB,
                                                           Authentication authentication,
                                                           HttpServletRequest request,
                                                           boolean isUpdate) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "Authentication is required"
            ));
        }

        Optional<UserInfoDB> actorInfo = lmsDaoInterf.getUserInfo(authentication.getName().trim());
        if (actorInfo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "Authenticated user details were not found"
            ));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ADMIN".equals(authority.getAuthority()) || "SUPER_ADMIN".equals(authority.getAuthority()));
        boolean isTeacher = authentication.getAuthorities().stream()
                .anyMatch(authority -> "TEACHER".equals(authority.getAuthority()));

        if (!isAdmin && !isTeacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "Only admin or teacher users can manage courses"
            ));
        }

        boolean skillProgramRequest = request != null
                && request.getRequestURI() != null
                && request.getRequestURI().contains("/skill-programs");

        if (libraryMasterDB.getMaterialName() == null || libraryMasterDB.getMaterialName().isBlank()) {
            return ResponseEntity.unprocessableEntity().body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "Course title is required"
            ));
        }

        if (libraryMasterDB.getMaterialCode() == null || libraryMasterDB.getMaterialCode().isBlank()) {
            return ResponseEntity.unprocessableEntity().body(Map.of(
                    "status", Boolean.FALSE,
                    "message", "Course code is required"
            ));
        }

        UserInfoDB courseOwner = new UserInfoDB();
        if (isAdmin && libraryMasterDB.getUserInfoDB() != null && libraryMasterDB.getUserInfoDB().getUserDetailsId() != null) {
            courseOwner.setUserDetailsId(libraryMasterDB.getUserInfoDB().getUserDetailsId());
        } else {
            courseOwner.setUserDetailsId(actorInfo.get().getUserDetailsId());
        }

        if (skillProgramRequest) {
            libraryMasterDB.setIsCertificationRequired(Boolean.TRUE);
        }

        libraryMasterDB.setUserInfoDB(courseOwner);
        ResponseEntity<Map<String, Object>> response = studyMaterialServiceInterf.saveMaterialDetails(libraryMasterDB);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            response.getBody().put("courseId", libraryMasterDB.getMaterialId());
            response.getBody().put("operation", isUpdate ? "updated" : "created");
        }

        return response;
    }
}
