package com.performance.Monitoring.Controller;

// import org.checkerframework.checker.units.qual.s;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Service.StudentService;
import org.springframework.web.bind.annotation.PathVariable;

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
}
