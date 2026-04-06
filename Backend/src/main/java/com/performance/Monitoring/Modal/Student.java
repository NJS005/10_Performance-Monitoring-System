package com.performance.Monitoring.Modal;

// import javax.print.DocFlavor.STRING;

// import org.checkerframework.checker.units.qual.A;
// import org.checkerframework.checker.units.qual.C;
// import com.performance.Monitoring.Modal.Address;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "students")
public class Student {

        @Id
        private String rollNo;

        // @Column(nullable = false)
        private String name;
        // @Column(nullable = false)
        private int batch;
        // @Column(nullable = false)
        private Long contactNo;
        // @Column(nullable = false)
        private String department;
        // @Column(nullable = false)
        private String program;
        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "faculty_advisor_id", referencedColumnName = "id")
        @JsonIgnore
        private Faculty facultyAdvisorEntity;

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "supervisor_id", referencedColumnName = "id")
        @JsonIgnore
        private Faculty supervisorEntity;

        @Transient
        private String facultyAdvisorTemp;

        @Transient
        private String supervisorTemp;

        @Embedded
        @AttributeOverrides({
                @AttributeOverride(name = "line1", column = @Column(name = "address_line1")),
                @AttributeOverride(name = "line2", column = @Column(name = "address_line2")),
                @AttributeOverride(name = "city", column = @Column(name = "address_city")),
                @AttributeOverride(name = "state", column = @Column(name = "address_state")),
                @AttributeOverride(name = "country", column = @Column(name = "address_country")),
                @AttributeOverride(name = "zip", column = @Column(name = "address_zip"))
        })
        private Address permanentAddress;

        @Embedded
        @AttributeOverrides({
                @AttributeOverride(name = "line1", column = @Column(name = "temp_address_line1")),
                @AttributeOverride(name = "line2", column = @Column(name = "temp_address_line2")),
                @AttributeOverride(name = "city", column = @Column(name = "temp_address_city")),
                @AttributeOverride(name = "state", column = @Column(name = "temp_address_state")),
                @AttributeOverride(name = "country", column = @Column(name = "temp_address_country")),
                @AttributeOverride(name = "zip", column = @Column(name = "temp_address_zip"))
        })
        private Address temporaryAddress;
        
                private String fatherName;
        private String motherName;
        private Long guardianContact;
        private String verificationStatus;
        private String date;

                // Not stored in students table: resolved from users table
                @Transient
                private String email;


        public Student() {
        }

        public String getRollNo() {
                return rollNo;
        }

        public void setRollNo(String rollNo) {
                this.rollNo = rollNo;
        }

        public String getName() {
                return name;
        }

        public void setName(String name) {
                this.name = name;
        }

        public int getBatch() {
                return batch;
        }

        public void setBatch(int batch) {
                this.batch = batch;
        }

        public Long getContactNo() {
                return contactNo;
        }

        public void setContactNo(Long contactNo) {
                this.contactNo = contactNo;
        }

        public Student(String rollNo, String name, int batch, Long contactNo, String department, String program,
                        String facultyAdvisor, String supervisor, Address permanentAddress, Address temporaryAddress,
                        String fatherName, String motherName, Long guardianContact, String verificationStatus,
                         String date  ) {
                this.rollNo = rollNo;
                this.name = name;
                this.batch = batch;
                this.contactNo = contactNo;
                this.department = department;
                this.program = program;
                this.facultyAdvisorTemp = facultyAdvisor;
                this.supervisorTemp = supervisor;
                this.permanentAddress = permanentAddress;
                this.temporaryAddress = temporaryAddress;
                this.fatherName = fatherName;
                this.motherName = motherName;
                this.guardianContact = guardianContact;
                this.verificationStatus = verificationStatus;
                this.date = date;
        }

        public String getDate() {
                return date;
        }
        public void setDate(String date) {
                this.date = date;
        }

        public String getDepartment() {
                return department;
        }

        public void setDepartment(String department) {
                this.department = department;
        }

        public String getProgram() {
                return program;
        }

        public void setProgram(String program) {
                this.program = program;
        }

        @JsonGetter("facultyAdvisor")
        public String getFacultyAdvisor() {
                return facultyAdvisorEntity != null ? facultyAdvisorEntity.getName() : facultyAdvisorTemp;
        }

        @JsonSetter("facultyAdvisor")
        public void setFacultyAdvisor(String facultyAdvisor) {
                this.facultyAdvisorTemp = facultyAdvisor;
        }

        @JsonGetter("supervisor")
        public String getSupervisor() {
                return supervisorEntity != null ? supervisorEntity.getName() : supervisorTemp;
        }

        @JsonSetter("supervisor")
        public void setSupervisor(String supervisor) {
                this.supervisorTemp = supervisor;
        }

        public Faculty getFacultyAdvisorEntity() {
                return facultyAdvisorEntity;
        }

        public void setFacultyAdvisorEntity(Faculty facultyAdvisorEntity) {
                this.facultyAdvisorEntity = facultyAdvisorEntity;
        }

        public Faculty getSupervisorEntity() {
                return supervisorEntity;
        }

        public void setSupervisorEntity(Faculty supervisorEntity) {
                this.supervisorEntity = supervisorEntity;
        }

        public String getFacultyAdvisorTemp() {
                return facultyAdvisorTemp;
        }

        public void setFacultyAdvisorTemp(String facultyAdvisorTemp) {
                this.facultyAdvisorTemp = facultyAdvisorTemp;
        }

        public String getSupervisorTemp() {
                return supervisorTemp;
        }

        public void setSupervisorTemp(String supervisorTemp) {
                this.supervisorTemp = supervisorTemp;
        }

        public Address getPermanentAddress() {
                return permanentAddress;
        }

        public void setPermanentAddress(Address permanentAddress) {
                this.permanentAddress = permanentAddress;
        }

        public Address getTemporaryAddress() {
                return temporaryAddress;
        }

        public void setTemporaryAddress(Address temporaryAddress) {
                this.temporaryAddress = temporaryAddress;
        }

        public String getFatherName() {
                return fatherName;
        }

        public void setFatherName(String fatherName) {
                this.fatherName = fatherName;
        }

        public String getMotherName() {
                return motherName;
        }

        public void setMotherName(String motherName) {
                this.motherName = motherName;
        }

        public Long getGuardianContact() {
                return guardianContact;
        }

        public void setGuardianContact(Long guardianContact) {
                this.guardianContact = guardianContact;
        }

        public String getVerificationStatus() {
                return verificationStatus;
        }

        public void setVerificationStatus(String verificationStatus) {
                this.verificationStatus = verificationStatus;
        }

                public String getEmail() {
                        return email;
                }

                public void setEmail(String email) {
                        this.email = email;
                }

        

}
