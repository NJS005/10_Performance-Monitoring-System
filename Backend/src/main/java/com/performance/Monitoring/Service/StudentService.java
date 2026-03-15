package com.performance.Monitoring.Service;

// import org.checkerframework.checker.units.qual.A;
import org.springframework.stereotype.Service;
import com.performance.Monitoring.Repo.StudentRepo;
import com.performance.Monitoring.dto.CoCurricularDTO;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Modal.CoCurricular;
import com.performance.Monitoring.Modal.Courses;
import com.performance.Monitoring.Repo.CoRepo;
import com.performance.Monitoring.Repo.CoursesRepo;
import java.util.Set;
import java.util.ArrayList;
import java.io.IOException;

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

  
    public void addStudentCoCurricular(String rollNumber, List<CoCurricularDTO> dtos) {

 
        List<CoCurricular> existing = coRepo.findByRollNo(rollNumber);
        Set<String> existingSet = existing.stream()
                .map(c -> c.getTitle())
                .collect(Collectors.toSet());

        List<CoCurricular> newRecordsToSave = new ArrayList<>();


        if (dtos == null)
            return;

        for (CoCurricularDTO dto : dtos) {
            String key = dto.getTitle();

            if (!existingSet.contains(key)) {
         
                CoCurricular co = new CoCurricular();
                co.setRollNo(rollNumber);
                co.setTitle(dto.getTitle());
                co.setDescription(dto.getDescription());
                co.setType(dto.getType());
                co.setCertificateName(dto.getCertificateName());
                co.setDate(dto.getDate());

              
                if (dto.getCertificate() != null && !dto.getCertificate().isEmpty()) {
                    try {
                        co.setCertificate(dto.getCertificate().getBytes());
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to save certificate file for " + dto.getTitle(), e);
                    }
                }

                newRecordsToSave.add(co);
            }
        }

        if (!newRecordsToSave.isEmpty()) {
            coRepo.saveAll(newRecordsToSave);
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
}
