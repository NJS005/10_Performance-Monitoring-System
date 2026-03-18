package com.performance.Monitoring.Security;

import com.performance.Monitoring.Modal.User;
import com.performance.Monitoring.Modal.Student;
import com.performance.Monitoring.Modal.Faculty;
import com.performance.Monitoring.Repo.StudentRepo;
import com.performance.Monitoring.Repo.FacultyRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service("securityService")
public class SecurityService {

    @Autowired
    private StudentRepo studentRepo;
    
    @Autowired
    private FacultyRepo facultyRepo;

    public boolean canReadStudent(String rollNumber) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        
        System.out.println("Processing canReadStudent for " + rollNumber);
        
        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) return false;
        User currentUser = (User) principal;
        
        String role = currentUser.getRole();
        System.out.println("Current user role: " + role);
        
        if ("Admin".equalsIgnoreCase(role)) return true;
        
        if ("Student".equalsIgnoreCase(role)) {
            return isStudentSelf(currentUser.getEmail(), rollNumber);
        }
        
        if ("Faculty Advisor".equalsIgnoreCase(role)) {
            return isFacultyAdvisor(currentUser.getEmail(), rollNumber);
        }
        
        return false;
    }

    public boolean canWriteStudent(String rollNumber) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        
        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) return false;
        User currentUser = (User) principal;
        
        String role = currentUser.getRole();
        
        if ("Admin".equalsIgnoreCase(role)) return true;
        
        if ("Student".equalsIgnoreCase(role)) {
            return isStudentSelf(currentUser.getEmail(), rollNumber);
        }
        
        return false;
    }

    private boolean isStudentSelf(String email, String requestedRollNo) {
        try {
            String[] parts = email.split("_");
            if (parts.length > 1) {
                String extractedRollNo = parts[1].split("@")[0].toUpperCase();
                return requestedRollNo.equalsIgnoreCase(extractedRollNo);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private boolean isFacultyAdvisor(String email, String rollNumber) {
        Optional<Student> studentOpt = studentRepo.findById(rollNumber);
        if (studentOpt.isPresent()) {
            String faName = studentOpt.get().getFacultyAdvisor();
            if (faName != null && !faName.trim().isEmpty()) {
                List<Faculty> faculties = facultyRepo.findByNameIgnoreCase(faName.trim());
                for (Faculty f : faculties) {
                    if (email.equalsIgnoreCase(f.getEmail())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
