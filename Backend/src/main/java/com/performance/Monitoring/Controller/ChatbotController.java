package com.performance.Monitoring.Controller;

import com.performance.Monitoring.Modal.Courses;
import com.performance.Monitoring.Repo.CoursesRepo;
import com.performance.Monitoring.Service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.io.InputStream;
import java.io.IOException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatbotController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CoursesRepo coursesRepo;

    @PostMapping("/chat/{rollNo}")
    public ResponseEntity<Map<String, String>> chatWithAcademicAssistant(
            @PathVariable String rollNo,
            @RequestBody Map<String, String> body) {
            
        String userMessage = body.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        // Gather student context
        List<Courses> studentCourses = coursesRepo.findByRollNo(rollNo);
        String courseHistory = studentCourses.stream()
                .map(c -> String.format("Semester %d: %s (%s) - Grade: %c", 
                          c.getSemester(), c.getCourseName(), c.getCourseCode(), c.getGrade()))
                .collect(Collectors.joining("\n"));

        // Read syllabus logic
        String syllabusText = "Syllabus not found.";
        try {
            ClassPathResource resource = new ClassPathResource("nitc_syllabus.txt");
            syllabusText = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Build the system prompt
        String systemInstruction = "You are a helpful and intelligent academic advisor tailored for NITC (National Institute of Technology Calicut) students. " +
                "You have direct access to the student's academic history. Analyze their grades, identify strengths/weaknesses (S and A are top grades, D and R are poor), and " +
                "provide customized advice for upcoming electives, study strategies, and academic guidance based on the NITC syllabus structure.\n\n" +
                "NITC SYLLABUS DATA AND RULES:\n" +
                syllabusText + "\n\n" +
                "Student's Academic History:\n" +
                (courseHistory.isEmpty() ? "No course history available." : courseHistory) +
                "\n\nRules:\n" +
                "1. Keep responses concise, supportive, and formatted professionally with markdown.\n" +
                "2. Acknowledge their strengths and provide constructive strategies for lower grades.\n" +
                "3. Use the course history data strictly. Do not invent fake grades.\n" +
                "4. Structure responses with short bullet points when recommending classes.";

        String aiResponse = geminiService.generateResponse(systemInstruction, userMessage);
        
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }
}
