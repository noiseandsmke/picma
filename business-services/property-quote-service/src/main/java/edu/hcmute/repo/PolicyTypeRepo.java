package edu.hcmute.repo;

import edu.hcmute.model.PolicyType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyTypeRepo extends JpaRepository<PolicyType, Integer> {
}