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

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:3001")
public class FacultyController {

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private com.performance.Monitoring.Service.EmailService emailService;

    @Autowired
    private com.performance.Monitoring.Repo.UserRepo userRepo;

    @PreAuthorize("hasRole('ADMIN') or (hasRole('FACULTY_ADVISOR') and principal.email == #email)")
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
        List<Student> students = studentRepo.findByFacultyAdvisorEntity_Name(advisorName);

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

    @PreAuthorize("hasRole('ADMIN') or (hasRole('FACULTY_ADVISOR') and principal.email == #email)")
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
        List<Student> students = studentRepo.findByFacultyAdvisorEntity_Name(advisorName);

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

    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY_ADVISOR')")
    @PostMapping("/approve/{rollNo}")
    public ResponseEntity<?> approveStudent(@PathVariable String rollNo, @RequestBody(required = false) Map<String, String> body) {
        Optional<Student> studentOpt = studentRepo.findById(rollNo);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        student.setVerificationStatus("approved");
        studentRepo.save(student);

        // Send Email
        String feedback = body != null ? body.get("feedback") : null;
        if (student.getName() != null) {
            com.performance.Monitoring.Modal.User u = userRepo.findByName(student.getName()).orElse(null);
            if (u != null && u.getEmail() != null) {
                String subject = "Your profile has been approved";
                String text = "Dear " + student.getName() + ",\n\nYour profile has been approved by your faculty advisor.";
                if (feedback != null && !feedback.isBlank()) {
                    text += "\n\nFeedback from faculty: " + feedback;
                }
                try {
                    System.out.println("Attempting to send approval email to: " + u.getEmail());
                    emailService.sendEmail(u.getEmail(), subject, text);
                    System.out.println("Successfully sent approval email to: " + u.getEmail());
                } catch (Exception e) {
                    System.err.println("Failed to send email: " + e.getMessage());
                }
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Student approved successfully"));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY_ADVISOR')")
    @PostMapping("/reject/{rollNo}")
    public ResponseEntity<?> rejectStudent(@PathVariable String rollNo, @RequestBody(required = false) Map<String, String> body) {
        Optional<Student> studentOpt = studentRepo.findById(rollNo);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        student.setVerificationStatus("rejected");
        // Could also capture remarks if we added a field on the Student entity, but we will leave it as is for now mimicking approve.
        studentRepo.save(student);

        // Send Email
        String feedback = body != null ? body.get("feedback") : null;
        if (student.getName() != null) {
            com.performance.Monitoring.Modal.User u = userRepo.findByName(student.getName()).orElse(null);
            if (u != null && u.getEmail() != null) {
                String subject = "Your profile has been rejected";
                String text = "Dear " + student.getName() + ",\n\nYour profile verification has been rejected by your faculty advisor.";
                if (feedback != null && !feedback.isBlank()) {
                    text += "\n\nFeedback from faculty: " + feedback;
                }
                text += "\n\nPlease correct the issues and submit again.";
                try {
                    System.out.println("Attempting to send rejection email to: " + u.getEmail());
                    emailService.sendEmail(u.getEmail(), subject, text);
                    System.out.println("Successfully sent rejection email to: " + u.getEmail());
                } catch (Exception e) {
                    System.err.println("Failed to send email: " + e.getMessage());
                }
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Student rejected successfully"));
    }
}

