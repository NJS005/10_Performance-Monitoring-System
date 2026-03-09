package com.performance.Monitoring.Repo;

import org.springframework.stereotype.Repository;

@Repository
public interface CourseVerificationRepo extends org.springframework.data.jpa.repository.JpaRepository<com.performance.Monitoring.Modal.CourseVerification, Long>    {

}
