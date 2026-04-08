package com.soul.lms.webinar.controller;


import com.soul.lms.model.entity.webinar.WebinarAttended;
import com.soul.lms.model.entity.webinar.WebinarEntity;
import com.soul.lms.model.entity.webinar.WebinarRegister;
import com.soul.lms.model.entity.webinar.WebinarWatchProgress;
import com.soul.lms.webinar.service.WebinarServiceInterf;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.Option;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/webinar")
@CrossOrigin
public class WebinarController {

    private final WebinarServiceInterf webinarServiceInterf;

    @Autowired
    public WebinarController(WebinarServiceInterf webinarServiceInterf) {
        super();
        this.webinarServiceInterf = webinarServiceInterf;
    }

    @GetMapping("/fetchWebinarsByDateOrId")
    public ResponseEntity<WebinarEntity> fetchWebinarDetails(@RequestParam @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate searchDate, @RequestParam(required = false) Optional<Long> webinarId){

        //Call the service method to fetch webinar details
        return webinarServiceInterf.fetchWebinarDetailsByDateOrId(searchDate, webinarId);
    }

    @GetMapping("/fetchWebinarsFromToday")
    public ResponseEntity<Map<String,Object>> fetchWebinarDetailsFromToday(@RequestParam String username, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam (required = false) Optional<Long> subjectId){

        //Call the service layer method to fetch list of webinars from today
        return webinarServiceInterf.fetchWebinarDetailsFromToday(username, page, size, subjectId);
    }

    @PostMapping("/registerForWebinar")
    public ResponseEntity<Map<String ,Object>> registerWebinar(@RequestBody @Valid WebinarRegister webinarRegister){

        //Call the service Layer method to post registration of webinars
        return webinarServiceInterf.registerWebinar(webinarRegister);
    }

    @GetMapping("/fetchRegisteredWebinars")
    public ResponseEntity<Map<String,Object>> fetchRegisteredWebinars(@RequestParam String username,@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){

        //call the service layer method to fetch list of registered webinars
        return webinarServiceInterf.fetchRegisteredWebinars(username,page,size);
    }

    @PostMapping("/joinWebinar")
    public ResponseEntity<Map<String ,Object>> joinWebinar(@RequestBody @Valid WebinarAttended webinarAttended){

        //call the service layer method to join in webinar
        return webinarServiceInterf.joinWebinar(webinarAttended);
    }

    @GetMapping("/fetchAttendedWebinars")
    public ResponseEntity<Map<String ,Object>> fetchAttendedWebinars(@RequestParam String username, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){

        //call the service layer method to fetch list of attended webinars
        return webinarServiceInterf.fetchAttendedWebinars(username,page,size);
    }

    @GetMapping("/recorded-webinars")
    public ResponseEntity<Map<String, Object>> fetchRecordedWebinars(@RequestParam String username) {
        return webinarServiceInterf.fetchRecordedWebinars(username);
    }

    @GetMapping("/recorded-webinar/{webinarInfoId}")
    public ResponseEntity<Map<String, Object>> fetchRecordedWebinarDetails(@PathVariable Long webinarInfoId,
                                                                           @RequestParam String username) {
        return webinarServiceInterf.fetchRecordedWebinarDetails(webinarInfoId, username);
    }

    @PostMapping("/progress")
    public ResponseEntity<Map<String, Object>> saveWebinarProgress(@RequestBody @Valid WebinarWatchProgress webinarWatchProgress) {
        return webinarServiceInterf.saveWebinarProgress(webinarWatchProgress);
    }

}
