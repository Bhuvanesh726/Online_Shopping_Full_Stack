package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8081}")
    private String baseUrl;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No file provided"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only image files are allowed"));
        }

        try {
            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : ".jpg";
            String uniqueFilename = UUID.randomUUID() + extension;

            // Save the file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the public URL
            String fileUrl = baseUrl + "/api/uploads/files/" + uniqueFilename;
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", fileUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename).normalize();
            org.springframework.core.io.Resource resource =
                    new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "application/octet-stream";
                if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                else if (filename.endsWith(".webp")) contentType = "image/webp";

                return ResponseEntity.ok()
                        .header("Content-Type", contentType)
                        .header("Cache-Control", "max-age=86400")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
