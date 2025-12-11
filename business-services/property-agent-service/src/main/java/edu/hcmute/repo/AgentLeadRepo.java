package edu.hcmute.repo;

import edu.hcmute.domain.LeadAction;
import edu.hcmute.entity.AgentLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AgentLeadRepo extends JpaRepository<AgentLead, Integer> {
    List<AgentLead> findByLeadId(int leadId);

    List<AgentLead> findByAgentId(String agentId);

    List<AgentLead> findByLeadActionAndCreatedAtBefore(LeadAction action, LocalDateTime dateTime);

    Optional<AgentLead> findByAgentIdAndLeadId(String agentId, int leadId);
}