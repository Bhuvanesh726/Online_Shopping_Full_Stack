package com.shopease.service;

import com.shopease.dto.MessageDto;
import com.shopease.model.Message;
import com.shopease.model.User;
import com.shopease.repository.MessageRepository;
import com.shopease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageDto sendMessage(MessageDto request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .isRead(false)
                .build();

        message = messageRepository.save(message);
        MessageDto response = mapToDto(message);

        // Send over WebSocket to receiver
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(), "/queue/messages", response);

        return response;
    }

    public List<MessageDto> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<User> getContacts(Long userId) {
        return messageRepository.findAllContacts(userId);
    }

    public List<MessageDto> getMyMessages(Long userId) {
        return messageRepository.findByReceiverIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (message.getReceiver().getId().equals(userId)) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }

    private MessageDto mapToDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getName())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
