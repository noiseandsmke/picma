package edu.hcmute.repo;

import edu.hcmute.model.CoverageType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoverageTypeRepo extends JpaRepository<CoverageType, Integer> {
}