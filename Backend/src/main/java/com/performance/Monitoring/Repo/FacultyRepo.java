package com.performance.Monitoring.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.performance.Monitoring.Modal.Faculty;

import java.util.Optional;

@Repository
public interface FacultyRepo extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmail(String email);
}