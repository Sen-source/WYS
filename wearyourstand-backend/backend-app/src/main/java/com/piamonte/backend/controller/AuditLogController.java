package com.piamonte.backend.controller;

import com.piamonte.biz.data.AuditLog;
import com.piamonte.biz.data.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @GetMapping
    public ResponseEntity<List<AuditLogDto>> getAuditLogs() {
        try {
            List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
            List<AuditLogDto> logDtos = logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(logDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogDto>> getAuditLogsByEntity(
            @PathVariable String entityType, 
            @PathVariable Long entityId) {
        try {
            List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
            List<AuditLogDto> logDtos = logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(logDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogDto>> getAuditLogsByUser(@PathVariable Long userId) {
        try {
            List<AuditLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
            List<AuditLogDto> logDtos = logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(logDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private AuditLogDto convertToDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setTimestamp(log.getTimestamp());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setUserId(log.getUserId());
        dto.setUserEmail(log.getUserEmail());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        return dto;
    }
    
    public static class AuditLogDto {
        private Long id;
        private LocalDateTime timestamp;
        private String action;
        private String entityType;
        private Long entityId;
        private Long userId;
        private String userEmail;
        private String details;
        private String ipAddress;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        
        public Long getEntityId() { return entityId; }
        public void setEntityId(Long entityId) { this.entityId = entityId; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    }
}
