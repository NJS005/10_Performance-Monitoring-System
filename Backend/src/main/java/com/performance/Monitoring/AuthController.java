package com.performance.Monitoring;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
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


    private static final String CLIENT_ID = "750796996880-c4875choh43f78urk1d5gt06orqln9q1.apps.googleusercontent.com";

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> data) {
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
                if (domain == null || !domain.equals("nitc.ac.in")) {
                    return ResponseEntity.status(403).body("Must use @nitc.ac.in email");
                }


                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;

                if (existingUser.isPresent()) {
                    user = existingUser.get();
                } else {

                    user = new User();
                    user.setEmail(email);
                    user.setName((String) payload.get("name"));
                    user.setPictureUrl((String) payload.get("picture"));
                    user.setRole(requestedRole);
                    userRepository.save(user);
                }

                return ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "user", user
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error verifying token");
        }
        return ResponseEntity.status(401).body("Invalid token");
    }
}