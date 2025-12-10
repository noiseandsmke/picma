package edu.hcmute.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "owner_histories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerHistory {
    @Id
    private String id;
    private String ownerId;
    private Integer leadId;
    private String propertyId;
    private String status;
    private String reason;
    private LocalDateTime updatedAt;
}