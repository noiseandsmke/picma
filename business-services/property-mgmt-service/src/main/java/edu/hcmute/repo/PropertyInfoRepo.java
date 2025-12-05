package edu.hcmute.repo;

import edu.hcmute.entity.PropertyInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PropertyInfoRepo extends MongoRepository<PropertyInfo, String> {
    @Query("{'location.zipCode': ?0}")
    List<PropertyInfo> findPropertiesByZipCode(String zipcode);

    List<PropertyInfo> findByUserId(String userId);
}