package com.performance.Monitoring.Modal;

import jakarta.persistence.*;
@Entity
@Table(name = "Courses")

public class Courses {

    @Id

    private String Rollno;

    @Column(nullable = false)
    private String CourseCode;
    private String CourseName;

    private int credit;
    private int semester;
    private char grade;
    private int  RequiredAtendedance;
    private int  totalClasses;
    private int  AtendedClasses;
}
