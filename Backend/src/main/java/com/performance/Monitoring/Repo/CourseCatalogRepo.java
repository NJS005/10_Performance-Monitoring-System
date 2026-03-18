package com.performance.Monitoring.Repo;

import com.performance.Monitoring.Modal.CourseCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseCatalogRepo extends JpaRepository<CourseCatalog, String> {
}
