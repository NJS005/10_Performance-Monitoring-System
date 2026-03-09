package com.performance.Monitoring.Modal;

import jakarta.persistence.*;


@Entity
@Table(name = "course_verification")
public class CourseVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rollNo;
    private int semester;
    private String verificationStatus;
    private byte[] document;

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

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public byte[] getDocument() {
        return document;
    }

    public void setDocument(byte[] document) {
        this.document = document;
    }

    public CourseVerification(Long id, String rollNo, int semester, String verificationStatus, byte[] document) {
        this.id = id;
        this.rollNo = rollNo;
        this.semester = semester;
        this.verificationStatus = verificationStatus;
        this.document = document;
    }
    

    
}
