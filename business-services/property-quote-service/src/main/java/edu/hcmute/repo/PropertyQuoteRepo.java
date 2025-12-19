package edu.hcmute.repo;

import edu.hcmute.entity.PropertyQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PropertyQuoteRepo extends JpaRepository<PropertyQuote, Integer>, JpaSpecificationExecutor<PropertyQuote> {
    List<PropertyQuote> findByLeadId(Integer leadId);

    List<PropertyQuote> findByAgentId(String agentId);

    List<PropertyQuote> findByCreateDateGreaterThanEqual(LocalDate date);
}