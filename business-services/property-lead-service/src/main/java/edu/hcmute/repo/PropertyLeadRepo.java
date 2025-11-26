package edu.hcmute.repo;

import edu.hcmute.domain.LeadStatus;
import edu.hcmute.entity.PropertyLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyLeadRepo extends JpaRepository<PropertyLead, Integer> {
    List<PropertyLead> findByStatus(LeadStatus status);
}
