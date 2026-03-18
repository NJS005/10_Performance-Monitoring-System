package com.performance.Monitoring.Service;

// import org.checkerframework.checker.units.qual.A;
import org.springframework.stereotype.Service;
import com.performance.Monitoring.Repo.StudentRepo;
// import com.performance.Monitoring.dto.CoCurricularDTO;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Modal.Attendance;
import com.performance.Monitoring.Modal.CoCurricular;
import com.performance.Monitoring.Modal.Courses;
import com.performance.Monitoring.Repo.CoRepo;
import com.performance.Monitoring.Repo.CoursesRepo;
import com.performance.Monitoring.Repo.AttendaceRepo;

import java.util.Set;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private CoursesRepo coursesRepo;

    @Autowired
    private CoRepo coRepo;

    @Autowired
    private AttendaceRepo attendanceRepo;

    public void putStudentDetails(Student student) {
        studentRepo.save(student);
        System.out.println("Fetching and storing student details...");
    }

    public Student getStudentByRollNumber(String rollNumber) {
        return studentRepo.findById(rollNumber).orElse(null);
    }

    public List<CoCurricular> getStudentCoCurricular(String rollNumber) {
        return coRepo.findByRollNo(rollNumber);
    }

    public void addStudentCoCurricular(String rollNumber, List<CoCurricular> coCurriculars)
    {
        List<CoCurricular> existingActivities = coRepo.findByRollNo(rollNumber);
        Set<String> existing = existingActivities.stream()
                .map(c -> c.getTitle())
                .collect(Collectors.toSet());

        

        for (CoCurricular activity : coCurriculars) {

            System.out.println("Trying to save: " + activity.getTitle());
            System.out.println("RollNo: " + rollNumber);

            if (!existing.contains(activity.getTitle())) {
                activity.setRollNo(rollNumber);
                coRepo.save(activity);
            }
        }

    }
    

    public List<Courses> getStudentCourses(String rollNumber) {
        List<Courses> courses = coursesRepo.findByRollNo(rollNumber);
        return courses;
    }

    public void addStudentCourses(String rollNumber, List<Courses> courses) {
        List<Courses> existingCourses = coursesRepo.findByRollNo(rollNumber);
        Set<String> existing = existingCourses.stream()
                .map(c -> c.getCourseCode() + "-" + c.getSemester())
                .collect(Collectors.toSet());

        for (Courses course : courses) {
            String key = course.getCourseCode() + "-" + course.getSemester();

            if (!existing.contains(key)) {
                course.setRollNo(rollNumber);
                coursesRepo.save(course);
            }
        }
    }

    public void updateAttendance(String rollNumber, List<Attendance> attendanceList) {

        for (Attendance att : attendanceList) {
            att.setRollNo(rollNumber);

            attendanceRepo.save(att);
        }
    }

    public List<Attendance> getStudentAttendance(String rollNumber) {

        Student student = studentRepo.findById(rollNumber).orElse(null);

        if (student == null) {
            return java.util.Collections.emptyList();
        }

        int batch = student.getBatch();

        int currentYear = java.time.Year.now().getValue();
        int month = java.time.LocalDate.now().getMonthValue();
        int semester = (currentYear - batch) * 2 + (month >= 7 ? 1 : 0);
        return attendanceRepo.findByRollNoAndSemester(rollNumber, semester);
    }

    public void deleteCoCurricular(String rollNumber, String title) {
    String cleanTitle = title.replaceAll("^\"|\"$", ""); // strip leading/trailing quotes
    List<CoCurricular> existingActivities = coRepo.findByRollNo(rollNumber);
    for (CoCurricular activity : existingActivities) {
        if (activity.getTitle().equals(cleanTitle)) {
            coRepo.delete(activity);
            break;
        }
    }
}
}
