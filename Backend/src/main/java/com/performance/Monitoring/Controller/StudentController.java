package com.performance.Monitoring.Controller;

import java.util.List;

// import org.checkerframework.checker.units.qual.s;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Service.StudentService;
import com.performance.Monitoring.dto.CoCurricularFormWrapper;
import org.springframework.http.MediaType;


import org.springframework.web.bind.annotation.PathVariable;
import com.performance.Monitoring.Modal.Courses;
// import com.performance.Monitoring.Modal.CoCurricular;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3001")
public class StudentController {
    
    @Autowired
    private StudentService studentService;

    @PostMapping("/details")
    public ResponseEntity<String> getStudentDetails(@RequestBody Student student) {
        studentService.putStudentDetails(student);
        System.out.println("Received student details: " + student);
        return ResponseEntity.ok("Student details submitted successfully");
    }

    @GetMapping("/details/{rollNumber}")
    public ResponseEntity<Student> getStudentByRollNumber(@PathVariable String rollNumber) {
        Student student = studentService.getStudentByRollNumber(rollNumber);
        if (student != null) {
            return ResponseEntity.ok(student);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/courses/{rollNumber}")
    public ResponseEntity<?> getStudentCourses(@PathVariable String rollNumber) {
        List<Courses> courses = studentService.getStudentCourses(rollNumber);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/courses/{rollNumber}")
    public ResponseEntity<String> addStudentCourse(@PathVariable String rollNumber, @RequestBody List<Courses> courses) {
        studentService.addStudentCourses(rollNumber, courses);
        return ResponseEntity.ok("Course added successfully");
    }

    @GetMapping("/cocurricular/{rollNumber}")
public ResponseEntity<?> getStudentCoCurricular(@PathVariable String rollNumber) {
    List<?> coCurriculars = studentService.getStudentCoCurricular(rollNumber);
    return ResponseEntity.ok(coCurriculars);
}

// Specify that this consumes MULTIPART_FORM_DATA
    @PostMapping(value = "/cocurricular/{rollNumber}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<String> addStudentCoCurricular(
        @PathVariable String rollNumber, 
        @ModelAttribute CoCurricularFormWrapper wrapper) { // Use @ModelAttribute!
    
    // Pass the list of DTOs to the service
    studentService.addStudentCoCurricular(rollNumber, wrapper.getActivities());
    
    return ResponseEntity.ok("Co-curricular activity added successfully");
}
}