package edu.hcmute.repo;

import edu.hcmute.model.PropertyAddress;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PropertyAddressRepo extends MongoRepository<PropertyAddress, String> {
}