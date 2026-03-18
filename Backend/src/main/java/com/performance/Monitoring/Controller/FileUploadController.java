package com.performance.Monitoring.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.performance.Monitoring.Service.FileStorageService;

@RestController
@RequestMapping("/api/student/upload")
@CrossOrigin(origins = "http://localhost:3001")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/cocurricular")
    public ResponseEntity<String> uploadCoCurricularPdf(@RequestParam("file") MultipartFile file) {
        try {
            String path = fileStorageService.storeFile(file, "cocurricular");
            return ResponseEntity.ok(path);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to store file: " + e.getMessage());
        }
    }
}
