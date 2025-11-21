package edu.hcmute.entity;

import edu.hcmute.domain.LeadAction;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class AgentLead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Enumerated(EnumType.STRING)
    private LeadAction leadAction;
    private int agentId;
    private int leadId;
    private LocalDateTime createdAt;
}