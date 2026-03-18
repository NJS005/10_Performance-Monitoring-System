package com.performance.Monitoring.Modal;

import jakarta.persistence.*;

@Entity
@Table(
    name = "courses",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_student_course",
            columnNames = {"roll_no", "course_code", "semester"}
        )
    }
)
public class Courses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rollNo;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_code", insertable = false, updatable = false)
    private CourseCatalog courseCatalog;

    @Transient
    private String courseName;
    @Transient
    private String courseType;
    @Transient
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
        if (courseName != null && !courseName.isEmpty()) return courseName;
        return courseCatalog != null ? courseCatalog.getCourseName() : null;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseType() {
        if (courseType != null && !courseType.isEmpty()) return courseType;
        return courseCatalog != null ? courseCatalog.getCourseType() : null;
    }

    public void setCourseType(String courseType) {
        this.courseType = courseType;
    }

    public int getCredit() {
        if (credit != 0) return credit;
        return courseCatalog != null ? courseCatalog.getCredit() : 0;
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