package edu.hcmute.entity;

import edu.hcmute.domain.LeadStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "property_lead")
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

    @Column(nullable = false)
    private String zipCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status;

    @Column(nullable = false)
    private LocalDate createDate;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = LocalDate.now();
        }
        if (status == null) {
            status = LeadStatus.NEW;
        }
    }
}