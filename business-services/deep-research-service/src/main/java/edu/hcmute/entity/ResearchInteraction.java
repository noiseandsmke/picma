package edu.hcmute.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lead_interaction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchInteraction {
    @Id
    @Column(name = "lead_id")
    private Integer leadId;
    @Column(name = "interaction_id")
    private String interactionId;
    @Column(name = "status")
    private String status;
    private LocalDateTime created;
    private LocalDateTime updated;
}