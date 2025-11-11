package edu.hcmute.repo;

import edu.hcmute.entity.PropertyLeadDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyLeadDetailRepo extends JpaRepository<PropertyLeadDetail, Integer> {
    List<PropertyLeadDetail> findByPropertyQuoteId(Integer quoteId);
}