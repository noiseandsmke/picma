package edu.hcmute.repo;

import edu.hcmute.entity.PropertyInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PropertyInfoRepo extends MongoRepository<PropertyInfo, String> {
    List<PropertyInfo> findByUserId(String userId);
}