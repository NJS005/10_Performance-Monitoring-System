package com.performance.Monitoring.Service;

// import org.checkerframework.checker.units.qual.A;
import org.springframework.stereotype.Service;
import com.performance.Monitoring.Repo.StudentRepo;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Modal.Courses;
import com.performance.Monitoring.Repo.CoursesRepo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private CoursesRepo coursesRepo;

    public void putStudentDetails(Student student) {
        studentRepo.save(student);
        System.out.println("Fetching and storing student details...");
    }

    public Student getStudentByRollNumber(String rollNumber) {
        return studentRepo.findById(rollNumber).orElse(null);
    }

    public List<Courses> getStudentCourses(String rollNumber) {
        List<Courses> courses = coursesRepo.findByRollNo(rollNumber);
        return courses;
    }

    public void addStudentCourses(String rollNumber, List<Courses> courses) {
        List<Courses> existingCourses = coursesRepo.findByRollNo(rollNumber);
        for (Courses course : courses) {
            for(Courses existingCourse : existingCourses) {
                if (existingCourse.getCourseCode().equals(course.getCourseCode())) {
                    if(existingCourse.getSemester() == course.getSemester()) {
                        if(existingCourse.getGrade() != course.getGrade()) {
                            existingCourse.setGrade(course.getGrade());
                            coursesRepo.save(existingCourse);
                        }
                    } else {
                        coursesRepo.save(course);
                    }
                }
            }
        }
    }
}   
