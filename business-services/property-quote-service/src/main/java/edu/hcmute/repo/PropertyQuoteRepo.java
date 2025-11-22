package edu.hcmute.repo;

import edu.hcmute.entity.PropertyQuote;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.jpa.repository.JpaRepository;

@JaversSpringDataAuditable
public interface PropertyQuoteRepo extends JpaRepository<PropertyQuote, Integer> {
}