package com.performance.Monitoring.Controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.performance.Monitoring.Modal.User;
import com.performance.Monitoring.Modal.Faculty;
import com.performance.Monitoring.Repo.UserRepo;
import com.performance.Monitoring.Repo.FacultyRepo;
import com.performance.Monitoring.Repo.StudentRepo;
import com.performance.Monitoring.Security.RateLimiter;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3001")
public class AuthController {

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private FacultyRepo facultyRepository;

    @Autowired
    private StudentRepo studentRepository;

    @Autowired
    private RateLimiter rateLimiter;

    private static final String CLIENT_ID = "750796996880-c4875choh43f78urk1d5gt06orqln9q1.apps.googleusercontent.com";

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> data,
                                            HttpServletRequest request) {
        // Rate-limit: 10 auth attempts per minute per IP
        String clientIp = request.getRemoteAddr();
        if (!rateLimiter.isAllowed("auth:" + clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many login attempts. Please try again in a minute.");
        }
        String idTokenString = data.get("token");
        String requestedRole = data.get("role");

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();


                String domain = payload.getHostedDomain();


                boolean isFaculty = requestedRole != null && requestedRole.toLowerCase().contains("faculty");

                String facultyName = null;
                if (isFaculty) {
                    Optional<Faculty> faculty = facultyRepository.findByEmail(email);
                    if (faculty.isEmpty()) {
                        return ResponseEntity.status(403).body("Faculty email not found in faculty records");
                    }
                    facultyName = faculty.get().getName();
                }

                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;
                
                if (existingUser.isPresent()) {
                    user = existingUser.get();
                    if (isFaculty && facultyName != null && !facultyName.equals(user.getName())) {
                        user.setName(facultyName);
                        userRepository.save(user);
                    }
                    // Check if student has completed profile setup.
                    // Email format: <prefix>_<ROLLNO>@nitc.ac.in → extract just ROLLNO
                    boolean studentExists = "Student".equalsIgnoreCase(user.getRole())
                            ? studentRepository.existsById(
                                    user.getEmail().contains("_")
                                    ? user.getEmail().split("_")[1].split("@")[0].toUpperCase()
                                    : user.getEmail().split("@")[0].toUpperCase())
                            : true;
                    return ResponseEntity.ok(Map.of(
                            "Existing User", "Login successful",
                            "user", user,
                            "email", email,
                            "studentExists", studentExists
                    ));

                } else {

                    user = new User();
                    user.setEmail(email);
                    user.setName(isFaculty && facultyName != null ? facultyName : (String) payload.get("name"));
                    user.setPictureUrl((String) payload.get("picture"));
                    user.setRole(requestedRole);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "New User", "Login successful",
                            "user", user ,
                            "email", email,
                            "studentExists", false
                    ));
                }

            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error verifying token");
        }
        return ResponseEntity.status(401).body("Invalid token");
    }
}