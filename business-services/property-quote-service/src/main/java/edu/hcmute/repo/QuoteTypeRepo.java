package edu.hcmute.repo;

import edu.hcmute.entity.QuoteType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteTypeRepo extends JpaRepository<QuoteType, Integer> {
}