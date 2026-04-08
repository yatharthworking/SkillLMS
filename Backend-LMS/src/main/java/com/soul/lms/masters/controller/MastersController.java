package com.soul.lms.masters.controller;

import com.soul.lms.masters.service.MastersServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/masters")
@CrossOrigin
public class MastersController {

    private final MastersServiceInterf mastersServiceInterf;


    @Autowired
    public MastersController(MastersServiceInterf mastersServiceInterf) {
        super();
        this.mastersServiceInterf = mastersServiceInterf;
    }


    // GET API to fetch batchMaster
    @GetMapping("/fetchBatchMaster")
    public ResponseEntity<Map<String, Object>> batchMaster(){
        return mastersServiceInterf.batchMaster();
    }
}
