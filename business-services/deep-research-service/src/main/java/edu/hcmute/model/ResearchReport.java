package edu.hcmute.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "research_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchReport {
    @Id
    private String id;

    @Field("owner_id")
    private String ownerId;

    @Field("property_id")
    private String propertyId;

    @Field("lead_id")
    private Integer leadId;

    @Field("final_summary")
    private String finalSummary;

    @Field("report_data")
    private String reportData;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}