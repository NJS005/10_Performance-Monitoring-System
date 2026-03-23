package com.performance.Monitoring.Modal;

import jakarta.persistence.*;


@Entity
@Table(name = "course_verification",
        uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_student_course_verification",
            columnNames = {"roll_no", "semester"}
        )
    }
)
public class CourseVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rollNo;
    private int semester;

    private String document;

    public CourseVerification() {
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

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }



    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public CourseVerification(Long id, String rollNo, int semester, String verificationStatus, String document) {
        this.id = id;
        this.rollNo = rollNo;
        this.semester = semester;
        this.document = document;
    }
    

    
}
