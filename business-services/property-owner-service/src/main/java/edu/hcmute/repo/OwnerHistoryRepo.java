package edu.hcmute.repo;

import edu.hcmute.entity.OwnerHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerHistoryRepo extends MongoRepository<OwnerHistory, String> {
    List<OwnerHistory> findByOwnerId(String ownerId);

    List<OwnerHistory> findByLeadId(Integer leadId);
}