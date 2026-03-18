
package com.performance.Monitoring.Modal;
import jakarta.persistence.*;


@Entity
@Table(
    name = "attendance",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_student_slot",
            columnNames = {"roll_no", "semester", "slot"}
        )
    }
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rollNo;

    private int semester;

    private String slot;

    private String courseName;

    private int attendanceRequirement;

    private int attendedClasses;

    private int totalClasses;

    private int isEnabled;

    public Attendance() {
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

    public String getSlot() {
        return slot;
    }

    public void setSlot(String slot) {
        this.slot = slot;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public int getAttendanceRequirement() {
        return attendanceRequirement;
    }

    public void setAttendanceRequirement(int attendanceRequirement) {
        this.attendanceRequirement = attendanceRequirement;
    }

    public int getAttendedClasses() {
        return attendedClasses;
    }

    public void setAttendedClasses(int attendedClasses) {
        this.attendedClasses = attendedClasses;
    }

    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public int getIsEnabled() {
        return isEnabled;
    }
    public void setIsEnabled(int isEnabled) {
        this.isEnabled = isEnabled;
    }
    
    public Attendance(Long id, String rollNo, int semester, String slot, String courseName, int attendanceRequirement,
            int attendedClasses, int totalClasses) {
        this.id = id;
        this.rollNo = rollNo;
        this.semester = semester;
        this.slot = slot;
        this.courseName = courseName;
        this.attendanceRequirement = attendanceRequirement;
        this.attendedClasses = attendedClasses;
        this.totalClasses = totalClasses;
        this.isEnabled = 1; // Default to enabled
    }
}