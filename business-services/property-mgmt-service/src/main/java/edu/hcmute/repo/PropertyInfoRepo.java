package edu.hcmute.repo;

import edu.hcmute.model.PropertyInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PropertyInfoRepo extends MongoRepository<PropertyInfo, String> {
    @Query("{'propertyAddress.zipCode': ?0}")
    List<PropertyInfo> findPropertiesByZipCode(String zipcode);
}