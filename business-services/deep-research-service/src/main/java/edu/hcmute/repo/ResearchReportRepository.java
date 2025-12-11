package edu.hcmute.repo;

import edu.hcmute.model.ResearchReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResearchReportRepository extends MongoRepository<ResearchReport, String> {
}