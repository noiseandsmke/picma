package edu.hcmute.entity;

import edu.hcmute.domain.LeadAction;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class AgentLeadAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Enumerated(EnumType.STRING)
    private LeadAction leadAction;
    private String agentId;
    private int leadId;
    private LocalDateTime createdAt;
}