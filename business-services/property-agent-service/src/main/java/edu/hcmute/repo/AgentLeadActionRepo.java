package edu.hcmute.repo;

import edu.hcmute.domain.LeadAction;
import edu.hcmute.entity.AgentLeadAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AgentLeadActionRepo extends JpaRepository<AgentLeadAction, Integer> {
    List<AgentLeadAction> findByLeadId(int leadId);

    List<AgentLeadAction> findByAgentId(String agentId);

    List<AgentLeadAction> findByLeadActionAndCreatedAtBefore(LeadAction action, LocalDateTime dateTime);

    Optional<AgentLeadAction> findByAgentIdAndLeadId(String agentId, int leadId);
}