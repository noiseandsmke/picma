package edu.hcmute.repo;

import edu.hcmute.entity.PropertyQuoteDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyQuoteDetailRepo extends JpaRepository<PropertyQuoteDetail, Integer> {
    List<PropertyQuoteDetail> findByPropertyQuoteLeadId(Integer leadId);
}
