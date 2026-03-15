package com.performance.Monitoring.dto;
import org.springframework.web.multipart.MultipartFile;

public class CoCurricularDTO {
    private String title;
    private String description;
    private String type;
    private String certificateName;
    private String date;
    
    // Notice this is MultipartFile, not byte[]
    private MultipartFile certificate; 

    // Generate Getters and Setters for all fields!
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCertificateName() { return certificateName; }
    public void setCertificateName(String certificateName) { this.certificateName = certificateName; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public MultipartFile getCertificate() { return certificate; }
    public void setCertificate(MultipartFile certificate) { this.certificate = certificate; }
}