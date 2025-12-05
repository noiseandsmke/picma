package edu.hcmute.repo;

import edu.hcmute.entity.PropertyQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyQuoteRepo extends JpaRepository<PropertyQuote, Integer> {
    List<PropertyQuote> findByLeadId(Integer leadId);

    List<PropertyQuote> findByAgentId(String agentId);
}