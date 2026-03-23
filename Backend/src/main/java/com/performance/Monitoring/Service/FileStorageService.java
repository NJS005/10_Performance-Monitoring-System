package com.performance.Monitoring.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    );

    private final String UPLOAD_DIR = "uploads/";

    public String storeFile(MultipartFile file, String subDir) throws IOException {

        // 1. Size check
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 5 MB limit.");
        }

        // 2. MIME type whitelist
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type. Only PDF and images are allowed.");
        }

        // 3. Sanitize filename and build path
        String cleanFileName = file.getOriginalFilename() != null
            ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-]", "_")
            : "file.pdf";
        String fileName = UUID.randomUUID().toString() + "_" + cleanFileName;

        Path uploadPath = Paths.get(UPLOAD_DIR + subDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 4. Path traversal guard — ensure resolved path stays inside upload dir
        Path filePath = uploadPath.resolve(fileName).normalize();
        if (!filePath.startsWith(uploadPath)) {
            throw new SecurityException("Path traversal attempt detected.");
        }

        Files.copy(file.getInputStream(), filePath);
        return "uploads/" + subDir + "/" + fileName;
    }
}
