package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.MessageDto;
import com.shopease.model.User;
import com.shopease.service.AuthService;
import com.shopease.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final AuthService authService;

    // WebSocket Message Handling
    @MessageMapping("/chat")
    public void processMessage(@Payload MessageDto request, Principal principal) {
        User user = authService.findByEmail(principal.getName());
        messageService.sendMessage(request, user.getId());
    }

    // HTTP Endpoints
    @PostMapping
    public ResponseEntity<ApiResponse> sendMessage(@RequestBody MessageDto request) {
        User user = authService.getCurrentUser();
        MessageDto response = messageService.sendMessage(request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Message sent", response));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<ApiResponse> getConversation(@PathVariable Long otherUserId) {
        User user = authService.getCurrentUser();
        List<MessageDto> messages = messageService.getConversation(user.getId(), otherUserId);
        return ResponseEntity.ok(ApiResponse.success("Conversation fetched", messages));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse> getContacts() {
        User user = authService.getCurrentUser();
        List<User> contacts = messageService.getContacts(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Contacts fetched", contacts));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount() {
        User user = authService.getCurrentUser();
        long count = messageService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        messageService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Message marked as read"));
    }
}
