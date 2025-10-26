package edu.hcmute.repo;

import edu.hcmute.entity.CoverageType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoverageTypeRepo extends JpaRepository<CoverageType, Integer> {
}