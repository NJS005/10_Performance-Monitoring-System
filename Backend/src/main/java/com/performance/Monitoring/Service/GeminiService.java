package com.performance.Monitoring.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public String generateResponse(String systemInstruction, String userMessage) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Payload
        Map<String, Object> requestBody = new HashMap<>();

        // System Instruction Content
        Map<String, Object> systemInstructionMap = new HashMap<>();
        Map<String, Object> sysParts = new HashMap<>();
        sysParts.put("text", systemInstruction);
        systemInstructionMap.put("parts", List.of(sysParts));
        requestBody.put("systemInstruction", systemInstructionMap);

        // Contents (User message)
        Map<String, Object> contentsMap = new HashMap<>();
        contentsMap.put("role", "user");
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", userMessage);
        contentsMap.put("parts", List.of(textPart));
        
        requestBody.put("contents", List.of(contentsMap));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
            return "No response from Gemini.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Gemini API: " + e.getMessage();
        }
    }
}
