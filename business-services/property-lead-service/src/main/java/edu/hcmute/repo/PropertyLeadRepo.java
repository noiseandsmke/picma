package edu.hcmute.repo;

import edu.hcmute.entity.PropertyLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyLeadRepo extends JpaRepository<PropertyLead, Integer> {
    List<PropertyLead> findByStatus(String status);
}