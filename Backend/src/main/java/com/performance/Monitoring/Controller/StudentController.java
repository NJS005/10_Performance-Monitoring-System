package com.performance.Monitoring.Controller;

import java.util.List;

// import org.checkerframework.checker.units.qual.s;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
import com.performance.Monitoring.Service.FileStorageService;
import com.performance.Monitoring.Repo.CourseVerificationRepo;
import com.performance.Monitoring.Modal.CourseVerification;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Modal.Attendance;
import com.performance.Monitoring.Modal.CoCurricular;
import com.performance.Monitoring.Service.StudentService;
// import com.performance.Monitoring.dto.CoCurricularFormWrapper;
// import org.springframework.http.MediaType;
// import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.PathVariable;
import com.performance.Monitoring.Modal.Courses;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3001")
public class StudentController {
    
    @Autowired
    private StudentService studentService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private CourseVerificationRepo courseVerificationRepo;

    @PreAuthorize("@securityService.canWriteStudent(#student.rollNo)")
    @PostMapping("/details")
    public ResponseEntity<String> getStudentDetails(@RequestBody Student student) {
        studentService.putStudentDetails(student);
        System.out.println("Received student details: " + student);
        return ResponseEntity.ok("Student details submitted successfully");
    }

    @PreAuthorize("@securityService.canReadStudent(#rollNumber)")
    @GetMapping("/details/{rollNumber}")
    public ResponseEntity<Student> getStudentByRollNumber(@PathVariable String rollNumber) {
        Student student = studentService.getStudentByRollNumber(rollNumber);
        if (student != null) {
            return ResponseEntity.ok(student);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("@securityService.canReadStudent(#rollNumber)")
    @GetMapping("/courses/{rollNumber}")
    public ResponseEntity<?> getStudentCourses(@PathVariable String rollNumber) {
        List<Courses> courses = studentService.getStudentCourses(rollNumber);
        return ResponseEntity.ok(courses);
    }

    @PreAuthorize("@securityService.canWriteStudent(#rollNumber)")
    @PostMapping("/courses/{rollNumber}")
    public ResponseEntity<String> addStudentCourse(@PathVariable String rollNumber, @RequestBody List<Courses> courses) {
        studentService.addStudentCourses(rollNumber, courses);
        return ResponseEntity.ok("Course added successfully");
    }

    @PreAuthorize("@securityService.canReadStudent(#rollNumber)")
    @GetMapping("/cocurricular/{rollNumber}")
public ResponseEntity<?> getStudentCoCurricular(@PathVariable String rollNumber) {
    List<CoCurricular> coCurriculars = studentService.getStudentCoCurricular(rollNumber);
    return ResponseEntity.ok(coCurriculars);
}


    @PreAuthorize("@securityService.canWriteStudent(#rollNumber)")
    @PostMapping(value = "/cocurricular/{rollNumber}")
        public ResponseEntity<String> addStudentCoCurricular(
        @PathVariable String rollNumber, 
        @RequestBody List<CoCurricular> coCurriculars) { // Use @ModelAttribute!
    
    // Pass the list of DTOs to the service
    studentService.addStudentCoCurricular(rollNumber, coCurriculars);
    
    return ResponseEntity.ok("Co-curricular activity added successfully");
    }

    @PreAuthorize("@securityService.canReadStudent(#rollNumber)")
    @GetMapping("/attendance/{rollNumber}")
    public ResponseEntity<?> getStudentAttendance(@PathVariable String rollNumber) {
        List<Attendance> attendance = studentService.getStudentAttendance(rollNumber);
        return ResponseEntity.ok(attendance);
    }

    @PreAuthorize("@securityService.canWriteStudent(#rollNumber)")
    @PostMapping("/attendance/{rollNumber}")
    public ResponseEntity<String> addStudentAttendance(@PathVariable String rollNumber, @RequestBody List<Attendance> attendance) {
        studentService.updateAttendance(rollNumber, attendance);
        return ResponseEntity.ok("Attendance record added successfully");
    }

    @PreAuthorize("@securityService.canWriteStudent(#rollNumber)")
    @DeleteMapping("/cocurricular/{rollNumber}")
    public ResponseEntity<String> deleteCoCurricular(
        @PathVariable String rollNumber, 
        @RequestParam("title") String title) {
            System.out.println("Received request to delete co-curricular activity: " + title + " for roll number: " + rollNumber);
        studentService.deleteCoCurricular(rollNumber, title);
        return ResponseEntity.ok("Co-curricular activity deleted successfully");
    }   

    @PreAuthorize("@securityService.canWriteStudent(#rollNo)")
    @PostMapping("/courses/upload-pdf")
    public ResponseEntity<String> uploadCoursePdf(
            @RequestParam("pdf") MultipartFile pdf,
            @RequestParam("rollNo") String rollNo,
            @RequestParam("semester") String semesterStr) {
        try {
            int semester = Integer.parseInt(semesterStr);
            String path = fileStorageService.storeFile(pdf, "courses");
            
            CourseVerification verification = courseVerificationRepo.findByRollNoAndSemester(rollNo, semester);
            if (verification == null) {
                verification = new CourseVerification();
                verification.setRollNo(rollNo);
                verification.setSemester(semester);
                verification.setVerificationStatus("pending");
            }
            verification.setDocument(path);
            courseVerificationRepo.save(verification);
            
            return ResponseEntity.ok("PDF uploaded and path saved: " + path);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload: " + e.getMessage());
        }
    }

    @PreAuthorize("@securityService.canReadStudent(#rollNo)")
    @GetMapping("/courses/verification/{rollNo}")
    public ResponseEntity<CourseVerification> getCourseVerification(
            @PathVariable String rollNo,
            @RequestParam("semester") int semester) {
        CourseVerification verification = courseVerificationRepo.findByRollNoAndSemester(rollNo, semester);
        if (verification != null) {
            return ResponseEntity.ok(verification);
        }
        return ResponseEntity.notFound().build();
    }

    @Autowired
    private com.performance.Monitoring.Repo.DailyAttendanceRepo dailyAttendanceRepo;

    @PreAuthorize("@securityService.canReadStudent(#rollNo)")
    @GetMapping("/daily-attendance/{rollNo}")
    public ResponseEntity<?> getDailyAttendance(@PathVariable String rollNo) {
        com.performance.Monitoring.Modal.DailyAttendance attendance = dailyAttendanceRepo.findByRollNo(rollNo);
        if (attendance == null) {
            attendance = new com.performance.Monitoring.Modal.DailyAttendance();
            attendance.setRollNo(rollNo);
        }
        return ResponseEntity.ok(attendance);
    }

    @PreAuthorize("@securityService.canWriteStudent(#rollNo)")
    @PostMapping("/daily-attendance/{rollNo}")
    public ResponseEntity<String> updateDailyAttendance(@PathVariable String rollNo, @RequestBody com.performance.Monitoring.Modal.DailyAttendance incoming) {
        com.performance.Monitoring.Modal.DailyAttendance existing = dailyAttendanceRepo.findByRollNo(rollNo);
        if (existing == null) {
            existing = new com.performance.Monitoring.Modal.DailyAttendance();
            existing.setRollNo(rollNo);
        }
        existing.setSlot1(incoming.getSlot1());
        existing.setSlot2(incoming.getSlot2());
        existing.setSlot3(incoming.getSlot3());
        existing.setSlot4(incoming.getSlot4());
        existing.setSlot5(incoming.getSlot5());
        existing.setSlot6(incoming.getSlot6());
        dailyAttendanceRepo.save(existing);
        
        return ResponseEntity.ok("Daily attendance updated successfully");
    }
}