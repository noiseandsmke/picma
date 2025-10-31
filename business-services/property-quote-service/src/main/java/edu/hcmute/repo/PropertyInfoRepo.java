package edu.hcmute.repo;

import edu.hcmute.entity.PropertyInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyInfoRepo extends JpaRepository<PropertyInfo, Integer> {
}