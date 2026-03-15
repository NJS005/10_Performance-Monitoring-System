package com.performance.Monitoring.Controller;

import com.performance.Monitoring.Modal.Faculty;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Repo.FacultyRepo;
import com.performance.Monitoring.Repo.StudentRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:3001")
public class FacultyController {

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private StudentRepo studentRepo;

    @GetMapping("/students")
    public ResponseEntity<?> getAssignedStudents(
            @RequestParam String email,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Missing faculty email");
        }

        Optional<Faculty> facultyOpt = facultyRepo.findByEmail(email);
        if (facultyOpt.isEmpty()) {
            return ResponseEntity.status(403).body("Faculty record not found for provided email");
        }

        String advisorName = facultyOpt.get().getName();
        List<Student> students = studentRepo.findByFacultyAdvisor(advisorName);

        // apply filters
        List<Student> filtered = students.stream()
                .filter(s -> program == null || program.isBlank() || program.equalsIgnoreCase(s.getProgram()))
                .filter(s -> status == null || status.isBlank() || status.equalsIgnoreCase(s.getVerificationStatus()))
                .filter(s -> {
                    if (search == null || search.isBlank()) return true;
                    String lower = search.toLowerCase();
                    return (s.getName() != null && s.getName().toLowerCase().contains(lower))
                            || (s.getRollNo() != null && s.getRollNo().toLowerCase().contains(lower));
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Missing faculty email");
        }

        Optional<Faculty> facultyOpt = facultyRepo.findByEmail(email);
        if (facultyOpt.isEmpty()) {
            return ResponseEntity.status(403).body("Faculty record not found for provided email");
        }

        String advisorName = facultyOpt.get().getName();
        List<Student> students = studentRepo.findByFacultyAdvisor(advisorName);

        long total = students.size();
        long pending = students.stream().filter(s -> "pending".equalsIgnoreCase(s.getVerificationStatus())).count();
        long approved = students.stream().filter(s -> "approved".equalsIgnoreCase(s.getVerificationStatus())).count();
        long rejected = students.stream().filter(s -> "rejected".equalsIgnoreCase(s.getVerificationStatus())).count();

        List<Student> recentSubmissions = students.stream()
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "total", total,
                "pending", pending,
                "approved", approved,
                "rejected", rejected,
                "recentSubmissions", recentSubmissions
        ));
    }
}

