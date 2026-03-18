package com.performance.Monitoring.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.performance.Monitoring.Modal.DailyAttendance;

@Repository
public interface DailyAttendanceRepo extends JpaRepository<DailyAttendance, Long> {
    DailyAttendance findByRollNo(String rollNo);
}
