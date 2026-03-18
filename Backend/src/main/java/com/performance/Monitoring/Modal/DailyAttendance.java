package com.performance.Monitoring.Modal;

import jakarta.persistence.*;

@Entity
@Table(name = "daily_attendance")
public class DailyAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String rollNo;

    private Boolean slot1 = null;
    private Boolean slot2 = null;
    private Boolean slot3 = null;
    private Boolean slot4 = null;
    private Boolean slot5 = null;
    private Boolean slot6 = null;

    public DailyAttendance() {
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

    public Boolean getSlot1() { return slot1; }
    public void setSlot1(Boolean slot1) { this.slot1 = slot1; }

    public Boolean getSlot2() { return slot2; }
    public void setSlot2(Boolean slot2) { this.slot2 = slot2; }

    public Boolean getSlot3() { return slot3; }
    public void setSlot3(Boolean slot3) { this.slot3 = slot3; }

    public Boolean getSlot4() { return slot4; }
    public void setSlot4(Boolean slot4) { this.slot4 = slot4; }

    public Boolean getSlot5() { return slot5; }
    public void setSlot5(Boolean slot5) { this.slot5 = slot5; }

    public Boolean getSlot6() { return slot6; }
    public void setSlot6(Boolean slot6) { this.slot6 = slot6; }
}
