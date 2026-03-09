package com.performance.Monitoring.Repo;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.performance.Monitoring.Modal.Courses;
import java.util.List;

@Repository
public interface CoursesRepo extends JpaRepository<Courses, Long>    {
    List<Courses> findByRollNo(String rollNo);
}
