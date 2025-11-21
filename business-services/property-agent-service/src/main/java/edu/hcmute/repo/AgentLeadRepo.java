package edu.hcmute.repo;

import edu.hcmute.domain.LeadAction;
import edu.hcmute.entity.AgentLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AgentLeadRepo extends JpaRepository<AgentLead, Integer> {
    List<AgentLead> findByLeadId(int leadId);

    List<AgentLead> findByLeadActionAndCreatedAtBefore(LeadAction action, LocalDateTime dateTime);
}