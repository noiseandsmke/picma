package edu.hcmute.repo;

import edu.hcmute.model.OccupancyType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface OccupancyTypeRepo extends MongoRepository<OccupancyType, String> {
    @Query("{'type': ?0}")
    List<OccupancyType> fetchOccupancyByType(String type);
}