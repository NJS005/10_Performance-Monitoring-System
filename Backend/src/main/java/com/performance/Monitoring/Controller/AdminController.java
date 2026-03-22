package com.performance.Monitoring.Controller;

import com.performance.Monitoring.Modal.Faculty;
import com.performance.Monitoring.Modal.User;
import com.performance.Monitoring.Repo.FacultyRepo;
import com.performance.Monitoring.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepo userRepo;


    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private com.performance.Monitoring.Repo.DepartmentRepo departmentRepo;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    // --- CREATE USER ---
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String role = (String) payload.get("role");

        if (userRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("User with this email already exists.");
        }

        // 1. Save to the general User table
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setRole(role);
        User savedUser = userRepo.save(newUser);

        // 2. If it's a Faculty Advisor, ALSO save to the Faculty table
        if ("Faculty Advisor".equalsIgnoreCase(role)) {
            Faculty faculty = new Faculty();
            faculty.setName(name);
            faculty.setEmail(email);

            // Safely grab the extra fields sent from React
            if (payload.containsKey("department")) {
                String deptCode = (String) payload.get("department");
                com.performance.Monitoring.Modal.Department d = departmentRepo.findByCodeIgnoreCase(deptCode);
                faculty.setDepartment(d);
            }
            if (payload.containsKey("designation")) {
                faculty.setDesignation((String) payload.get("designation"));
            }

            // Safely convert the contact number from String to long
            Object contactObj = payload.get("contactNo");
            if (contactObj != null && !contactObj.toString().trim().isEmpty()) {
                faculty.setContactNo(Long.parseLong(contactObj.toString()));
            }

            facultyRepo.save(faculty); // 🛑 Saves to your faculty table!
        }

        return ResponseEntity.ok(savedUser);
    }

    // --- UPDATE USER ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<User> existingUserOpt = userRepo.findById(id);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            String oldEmail = existingUser.getEmail();
            String newRole = (String) payload.get("role");
            String newName = (String) payload.get("name");
            String newEmail = (String) payload.get("email");

            // 1. Update the User table
            existingUser.setName(newName);
            existingUser.setEmail(newEmail);
            existingUser.setRole(newRole);
            userRepo.save(existingUser);

            // 2. If their role is Faculty Advisor, update (or create) their entry in the Faculty table
            if ("Faculty Advisor".equalsIgnoreCase(newRole)) {
                // Find existing faculty by their OLD email, or create a new one if they were just promoted
                Faculty faculty = facultyRepo.findByEmail(oldEmail).orElse(new Faculty());

                faculty.setName(newName);
                faculty.setEmail(newEmail);

                if (payload.containsKey("department")) {
                    String deptCode = (String) payload.get("department");
                    com.performance.Monitoring.Modal.Department d = departmentRepo.findByCodeIgnoreCase(deptCode);
                    faculty.setDepartment(d);
                }
                if (payload.containsKey("designation")) {
                    faculty.setDesignation((String) payload.get("designation"));
                }

                Object contactObj = payload.get("contactNo");
                if (contactObj != null && !contactObj.toString().trim().isEmpty()) {
                    faculty.setContactNo(Long.parseLong(contactObj.toString()));
                }

                facultyRepo.save(faculty);
            }

            return ResponseEntity.ok(existingUser);
        }
        return ResponseEntity.notFound().build();
    }

    // --- DELETE USER ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // If we are deleting a Faculty Advisor, remove them from the Faculty table first
            if ("Faculty Advisor".equalsIgnoreCase(user.getRole())) {
                facultyRepo.findByEmail(user.getEmail()).ifPresent(faculty -> facultyRepo.delete(faculty));
            }

            userRepo.deleteById(id);
            return ResponseEntity.ok().body("{\"message\": \"User deleted successfully.\"}");
        }
        return ResponseEntity.notFound().build();
    }
}