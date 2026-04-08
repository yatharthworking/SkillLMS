package com.soul.lms.publicCourses.controller;

import com.soul.lms.auth.registration.RegistrationServiceInterf;
import com.soul.lms.masters.service.MastersService;
import com.soul.lms.masters.service.MastersServiceInterf;
import com.soul.lms.model.entity.contactus.ContactUsEntity;
import com.soul.lms.model.entity.feedback.FeedbackEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.ImageUploadInput;
import com.soul.lms.student.service.StudentServiceInterf;
import com.soul.lms.studymaterials.service.StudyMaterialServiceInterf;
import com.soul.lms.webinar.service.WebinarServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/public")
@CrossOrigin
public class PublicController {

    private final StudyMaterialServiceInterf studyMaterialServiceInterf;

    private final MastersServiceInterf mastersServiceInterf;

    private final RegistrationServiceInterf registrationServiceInterf;

    private final WebinarServiceInterf webinarServiceInterf;

    @Autowired
    public PublicController(StudyMaterialServiceInterf studyMaterialServiceInterf, MastersServiceInterf mastersServiceInterf, RegistrationServiceInterf registrationServiceInterf, WebinarServiceInterf webinarServiceInterf) {
        super();
        this.studyMaterialServiceInterf = studyMaterialServiceInterf;
        this.mastersServiceInterf = mastersServiceInterf;
        this.registrationServiceInterf = registrationServiceInterf;
        this.webinarServiceInterf = webinarServiceInterf;
    }


    // GET API to fetch all courses
    @GetMapping("/getCourses")
    public ResponseEntity<Map<String, Object>> getCourses(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size, @RequestParam (required = false) Optional<Long> subjectId){
        return studyMaterialServiceInterf.getAllCourses(page, size, subjectId);
    }


    // GET API to fetch all webinars
    @GetMapping("/getWebinars")
    public ResponseEntity<Map<String, Object>> getWebinars(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size, @RequestParam (required = false) Optional<Long> subjectId) {
        return webinarServiceInterf.fetchAllWebinarsFromToday(page, size, subjectId);
    }


    // GET API to fetch organizationGroups under organizationMasterId
    @GetMapping("/fetchOrganizationsBranches")
    public ResponseEntity<Map<String, Object>> fetchOrganizationsBranches(@RequestParam Long organizationMasterId, @RequestParam Long userId) {
        return mastersServiceInterf.fetchOrganizationsBranches(organizationMasterId, userId);
    }


    // GET API to fetch organizationGroups under organizationMasterId
    @PostMapping("/saveContactUs")
    public ResponseEntity<Map<String, Object>> saveContactUs(@RequestBody ContactUsEntity contactUsEntity) {
        return registrationServiceInterf.saveContactUs(contactUsEntity);
    }

    // GET API to fetch subject master
    @GetMapping("/getSubjectMaster")
    public ResponseEntity<Map<String, Object>> getSubjectMaster(){
        return mastersServiceInterf.fetchSubjectMaster();
    }
}
