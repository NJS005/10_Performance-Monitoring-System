package com.performance.Monitoring.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.performance.Monitoring.Modal.CoCurricular;
import java.util.List;

@Repository
public interface CoRepo extends JpaRepository<CoCurricular,Long> {
    List<CoCurricular> findByRollNo(String rollNo);
}
