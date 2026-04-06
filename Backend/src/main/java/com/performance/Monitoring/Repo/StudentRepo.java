package com.performance.Monitoring.Repo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.performance.Monitoring.Modal.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepo extends JpaRepository<Student, String> {
    List<Student> findByFacultyAdvisorEntity_Name(String name);
    Optional<Student> findByEmail(String email);
}
