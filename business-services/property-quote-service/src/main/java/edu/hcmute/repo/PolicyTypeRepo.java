package edu.hcmute.repo;

import edu.hcmute.entity.PolicyType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyTypeRepo extends JpaRepository<PolicyType, Integer> {
}