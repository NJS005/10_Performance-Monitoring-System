package com.performance.Monitoring.Repo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.performance.Monitoring.Modal.Student;

@Repository
public interface StudentRepo extends JpaRepository<Student, String> {

}
