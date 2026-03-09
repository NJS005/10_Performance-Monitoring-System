package com.performance.Monitoring.Modal;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Courses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    private String rollNo;

    @Column(nullable = false)
    private String courseCode;
    private String courseName;
    private String courseType;
    private int credit;
    private int semester;
    private char grade;

    public Courses() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
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
    
        public String getCourseType() {
            return courseType;
        }
    
        public void setCourseType(String courseType) {
            this.courseType = courseType;
        }

        public Courses(Long id, String rollNo, String courseCode, String courseName, String courseType, int credit,
                int semester, char grade) {
            this.id = id;
            this.rollNo = rollNo;
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.courseType = courseType;
            this.credit = credit;
            this.semester = semester;
            this.grade = grade;
        }

   


    

}