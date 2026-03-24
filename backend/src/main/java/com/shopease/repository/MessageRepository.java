package com.shopease.repository;

import com.shopease.model.Message;
import com.shopease.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :id1 AND m.receiver.id = :id2) OR (m.sender.id = :id2 AND m.receiver.id = :id1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(Long id1, Long id2);

    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    @Query("SELECT DISTINCT u FROM User u WHERE u.id IN (" +
           "SELECT m.sender.id FROM Message m WHERE m.receiver.id = :id UNION " +
           "SELECT m.receiver.id FROM Message m WHERE m.sender.id = :id)")
    List<User> findAllContacts(Long id);
}
