package com.soul.lms.fileupload.controller;

import com.soul.lms.fileupload.service.FileUploadServiceInterf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class FileUploadController {


    private final FileUploadServiceInterf fileUploadServiceInterf;

    @Autowired
    public FileUploadController(FileUploadServiceInterf fileUploadServiceInterf) {
        super();
        this.fileUploadServiceInterf = fileUploadServiceInterf;
    }

    
    
    @PostMapping( "/bulk-upload")
    public ResponseEntity<Map<String,Object>> uploadSpreadSheet(@RequestPart("file")MultipartFile testQuestionFile, @RequestParam(required = false) Optional <Long> testId, @RequestParam(required = false) Optional <Long> chapterId, @RequestParam(required = false) Optional <Long> quizId, @RequestParam(required = false) Optional <Long> branchId, @RequestParam(required = false) Optional <String> name) {
        return fileUploadServiceInterf.uploadSpreadSheet(testQuestionFile, testId, chapterId, quizId, branchId, name);
    }

}
