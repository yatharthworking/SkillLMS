package com.soul.lms.publicCourses.controller;

import com.soul.lms.masters.service.MastersServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin
public class LegacyPublicController {

    private final MastersServiceInterf mastersServiceInterf;

    @Autowired
    public LegacyPublicController(MastersServiceInterf mastersServiceInterf) {
        this.mastersServiceInterf = mastersServiceInterf;
    }

    @GetMapping("/getSubjectMaster")
    public ResponseEntity<Map<String, Object>> getSubjectMaster() {
        return mastersServiceInterf.fetchSubjectMaster();
    }
}