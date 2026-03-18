package com.performance.Monitoring.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.performance.Monitoring.Repo.DepartmentRepo;
import com.performance.Monitoring.Repo.FacultyRepo;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:3001")
public class PublicController {

    @Autowired
    private DepartmentRepo departmentRepo;

    @Autowired
    private FacultyRepo facultyRepo;

    @GetMapping("/departments")
    public ResponseEntity<?> getAllDepartments() {
        return ResponseEntity.ok(departmentRepo.findAll());
    }

    @GetMapping("/faculty")
    public ResponseEntity<?> getFacultyByDepartment(@RequestParam String department) {
        if (department == null || department.isBlank()) {
            return ResponseEntity.badRequest().body("Department is required");
        }
        return ResponseEntity.ok(facultyRepo.findByDepartment_CodeIgnoreCase(department));
    }
}
