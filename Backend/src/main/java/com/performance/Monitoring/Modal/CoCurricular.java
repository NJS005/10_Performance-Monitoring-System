package com.performance.Monitoring.Modal;

import jakarta.persistence.*;

@Entity
@Table(
    name = "cocurricular",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_cocurricular",
            columnNames = {"roll_no", "title"}
        )
    }
)
public class CoCurricular {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idd;

    private String rollNo;
    private String title;
    private String description;
    private String type;
    private String certificateName;
    private String date;

    private byte[] certificate;

    public CoCurricular() {
    }

    public Long getIdd() {
        return idd;
    }

    public void setIdd(Long idd) {
        this.idd = idd;
    }



    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCertificateName() {
        return certificateName;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public byte[] getCertificate() {
        return certificate;
    }

    public void setCertificate(byte[] certificate) {
        this.certificate = certificate;
    }

    public CoCurricular(Long idd, String rollNo, String title, String description, String type,
            String certificateName, String date, byte[] certificate) {
        this.idd = idd;
        this.rollNo = rollNo;
        this.title = title;
        this.description = description;
        this.type = type;
        this.certificateName = certificateName;
        this.date = date;
        this.certificate = certificate;
    }

    
    
    
} 
