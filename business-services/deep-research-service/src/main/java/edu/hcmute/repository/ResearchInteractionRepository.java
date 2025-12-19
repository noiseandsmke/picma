package edu.hcmute.repository;

import edu.hcmute.entity.ResearchInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResearchInteractionRepository extends JpaRepository<ResearchInteraction, Integer> {
    Optional<ResearchInteraction> findByLeadId(Integer leadId);
    boolean existsByLeadId(Integer leadId);
}