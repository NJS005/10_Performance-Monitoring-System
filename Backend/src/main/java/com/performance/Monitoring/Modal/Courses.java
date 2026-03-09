package com.performance.Monitoring.Modal;

import jakarta.persistence.*;
@Entity
@Table(name = "courses")

public class Courses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    
    private String Rollno;

    @Column(nullable = false)
    private String CourseCode;
    private String CourseName;

    private int credit;
    private int semester;
    private char grade;
    private String verified;


    public String getRollno() {
        return Rollno;
    }
    public void setRollno(String rollno) {
        Rollno = rollno;
    }
    public String getCourseCode() {
        return CourseCode;
    }
    public void setCourseCode(String courseCode) {
        CourseCode = courseCode;
    }
    public String getCourseName() {
        return CourseName;
    }
    public void setCourseName(String courseName) {
        CourseName = courseName;
    }
    public int getCredit() {
        return credit;
    }
    public void setCredit(int credit) {
        this.credit = credit;
    }
    public int getSemester() {
        return semester;
    }
    public void setSemester(int semester) {
        this.semester = semester;
    }
    public char getGrade() {
        return grade;
    }
    public void setGrade(char grade) {
        this.grade = grade;
    }
    public String getVerified() {
        return verified;
    }
    public void setVerified(String verified) {
        this.verified = verified;
    }

    public Courses() {
    }
    public Courses(String rollno, String courseCode, String courseName, int credit, int semester, char grade,
            String verified) {
        Rollno = rollno;
        CourseCode = courseCode;
        CourseName = courseName;
        this.credit = credit;
        this.semester = semester;
        this.grade = grade;
        this.verified = verified;
    }
    
    
    
}
