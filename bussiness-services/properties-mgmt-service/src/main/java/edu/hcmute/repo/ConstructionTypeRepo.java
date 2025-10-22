package edu.hcmute.repo;

import edu.hcmute.model.ConstructionType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ConstructionTypeRepo extends MongoRepository<ConstructionType, String> {
    @Query("{'type': ?0}")
    List<ConstructionType> fetchConstructionByType(String type);
}