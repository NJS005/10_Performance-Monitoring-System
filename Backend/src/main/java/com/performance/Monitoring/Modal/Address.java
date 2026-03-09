package com.performance.Monitoring.Modal;
import jakarta.persistence.Embeddable;

@Embeddable
public class Address {
    
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String country;
    private String zip;

    public String getLine1() {
        return line1;
    }
    public String getLine2() {
        return line2;
    }
    public String getCity() {
        return city;
    }
    public String getState() {
        return state;
    }
    public String getCountry() {
        return country;
    }
    public void setLine1(String line1) {
        this.line1 = line1;
    }
    public void setLine2(String line2) {
        this.line2 = line2;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public void setState(String state) {
        this.state = state;
    }
    public void setCountry(String country) {
        this.country = country;
    }
    public void setZip(String zip) {
        this.zip = zip;
    }
    public String getZip() {
        return zip;
    }
    public Address(String line1, String line2, String city, String state, String country, String zip) {
        this.line1 = line1;
        this.line2 = line2;
        this.city = city;
        this.state = state;
        this.country = country;
        this.zip = zip;
    }
    public Address() {
    }
}