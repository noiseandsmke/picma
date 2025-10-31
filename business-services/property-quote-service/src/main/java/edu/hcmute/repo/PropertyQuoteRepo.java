package edu.hcmute.repo;

import edu.hcmute.entity.PropertyQuote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyQuoteRepo extends JpaRepository<PropertyQuote, Integer> {
}