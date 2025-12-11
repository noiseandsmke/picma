package edu.hcmute.repo;

import edu.hcmute.model.SystemContext;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemContextRepository extends CrudRepository<SystemContext, String> {
}