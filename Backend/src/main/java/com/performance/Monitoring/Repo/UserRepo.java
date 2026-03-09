package com.performance.Monitoring.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.performance.Monitoring.Modal.User;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}