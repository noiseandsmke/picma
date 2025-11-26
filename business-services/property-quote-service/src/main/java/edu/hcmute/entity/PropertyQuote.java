package edu.hcmute.entity;

import edu.hcmute.domain.PlanType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyQuote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer leadId;
    private String agentId;
    private String agentName;
    private LocalDate validUntil;
    private LocalDate startDate;
    private LocalDate endDate;
    private String propertyAddress;
    private Long sumInsured;

    @Enumerated(EnumType.STRING)
    private PlanType plan;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "propertyQuoteId")
    private List<Coverage> coverages = new ArrayList<>();

    @Embedded
    private Premium premium;
}
