package com.performance.Monitoring.Modal;

// import javax.print.DocFlavor.STRING;

// import org.checkerframework.checker.units.qual.A;
// import org.checkerframework.checker.units.qual.C;
// import com.performance.Monitoring.Modal.Address;
import jakarta.persistence.*;

@Entity
@Table(name = "student",
        uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_student_course_verification",
            columnNames = {"roll_no", "semester"}
        )
        }
)

public class Student {

        @Id
        private String rollNo;

        // @Column(nullable = false)
        private String name;
        // @Column(nullable = false)
        private int batch;
        // @Column(nullable = false)
        private long contactNo;
        // @Column(nullable = false)
        private String department;
        // @Column(nullable = false)
        private String program;
        private String facultyAdvisor;
        private String supervisor;

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
        private long guardianContact;
        private String verificationStatus;
        private String personalVerificationStatus;



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

        public long getContactNo() {
                return contactNo;
        }

        public void setContactNo(long contactNo) {
                this.contactNo = contactNo;
        }

        public Student(String rollNo, String name, int batch, long contactNo, String department, String program,
                        String facultyAdvisor, String supervisor, Address permanentAddress, Address temporaryAddress,
                        String fatherName, String motherName, long guardianContact, String verificationStatus,
                        String personalVerificationStatus) {
                this.rollNo = rollNo;
                this.name = name;
                this.batch = batch;
                this.contactNo = contactNo;
                this.department = department;
                this.program = program;
                this.facultyAdvisor = facultyAdvisor;
                this.supervisor = supervisor;
                this.permanentAddress = permanentAddress;
                this.temporaryAddress = temporaryAddress;
                this.fatherName = fatherName;
                this.motherName = motherName;
                this.guardianContact = guardianContact;
                this.verificationStatus = verificationStatus;
                this.personalVerificationStatus = personalVerificationStatus;
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

        public String getFacultyAdvisor() {
                return facultyAdvisor;
        }

        public void setFacultyAdvisor(String facultyAdvisor) {
                this.facultyAdvisor = facultyAdvisor;
        }

        public String getSupervisor() {
                return supervisor;
        }

        public void setSupervisor(String supervisor) {
                this.supervisor = supervisor;
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

        public long getGuardianContact() {
                return guardianContact;
        }

        public void setGuardianContact(long guardianContact) {
                this.guardianContact = guardianContact;
        }

        public String getVerificationStatus() {
                return verificationStatus;
        }

        public void setVerificationStatus(String verificationStatus) {
                this.verificationStatus = verificationStatus;
        }

        public String getPersonalVerificationStatus() {
                return personalVerificationStatus;
        }

        public void setPersonalVerificationStatus(String personalVerificationStatus) {
                this.personalVerificationStatus = personalVerificationStatus;
        }

}
