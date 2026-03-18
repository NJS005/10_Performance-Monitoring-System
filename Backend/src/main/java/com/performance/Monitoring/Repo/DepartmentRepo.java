package com.performance.Monitoring.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.performance.Monitoring.Modal.Department;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, Long> {
    Department findByCodeIgnoreCase(String code);
}
