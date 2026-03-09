package com.performance.Monitoring.Service;

// import org.checkerframework.checker.units.qual.A;
import org.springframework.stereotype.Service;
import com.performance.Monitoring.Repo.StudentRepo;
import com.performance.Monitoring.Modal.Student;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;

    public void putStudentDetails(Student student) {
        studentRepo.save(student);
        System.out.println("Fetching and storing student details...");
    }

    public Student getStudentByRollNumber(String rollNumber) {
        return studentRepo.findById(rollNumber).orElse(null);
    }
}
