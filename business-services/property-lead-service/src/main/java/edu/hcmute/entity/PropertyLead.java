package edu.hcmute.entity;

import edu.hcmute.domain.LeadStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyLead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String userInfo;

    @Column(nullable = false)
    private String propertyInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status = LeadStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate expiryDate;
}