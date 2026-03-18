package com.performance.Monitoring.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.performance.Monitoring.Modal.CourseVerification;

@Repository
public interface CourseVerificationRepo extends JpaRepository<CourseVerification, Long> {
    CourseVerification findByRollNoAndSemester(String rollNo, int semester);
}
