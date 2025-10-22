package edu.hcmute.repo;

import edu.hcmute.model.PropertyType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PropertyTypeRepo extends MongoRepository<PropertyType, String> {
}