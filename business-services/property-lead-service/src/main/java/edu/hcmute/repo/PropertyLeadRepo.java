package edu.hcmute.repo;

import edu.hcmute.domain.LeadStatus;
import edu.hcmute.entity.PropertyLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PropertyLeadRepo extends JpaRepository<PropertyLead, Integer>, JpaSpecificationExecutor<PropertyLead> {
    List<PropertyLead> findByStatus(LeadStatus status);

    List<PropertyLead> findByUserInfo(String userInfo);

    List<PropertyLead> findByZipCode(String zipCode);

    List<PropertyLead> findByCreateDateGreaterThanEqual(LocalDate date);
}