package edu.hcmute.repo;

import edu.hcmute.model.PropertyInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PropertyInfoRepo extends MongoRepository<PropertyInfo, String> {
}