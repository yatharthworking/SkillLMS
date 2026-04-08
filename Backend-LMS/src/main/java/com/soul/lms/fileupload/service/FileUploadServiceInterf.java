package com.soul.lms.fileupload.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

public interface FileUploadServiceInterf{

    
    
    ResponseEntity <Map <String, Object>> uploadSpreadSheet(MultipartFile questionFile, Optional <Long> testId, Optional <Long> chapterId, Optional <Long> quizId, Optional <Long> branchId, Optional<String> name);
}
