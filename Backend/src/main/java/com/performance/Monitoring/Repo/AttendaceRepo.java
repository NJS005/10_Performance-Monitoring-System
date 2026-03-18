package com.performance.Monitoring.Repo;
import org.springframework.stereotype.Repository;
import com.performance.Monitoring.Modal.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface AttendaceRepo extends JpaRepository<Attendance, Long>    {
        List<Attendance> findByRollNoAndSemester(String rollNo, int semester);
}
