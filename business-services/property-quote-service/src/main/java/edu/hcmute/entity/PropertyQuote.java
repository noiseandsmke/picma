package edu.hcmute.entity;

import edu.hcmute.domain.QuoteStatus;
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
    @Column(nullable = false)
    private Integer leadId;
    @Column(nullable = false)
    private String agentId;
    @Column(nullable = false, updatable = false)
    private LocalDate createDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuoteStatus status;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "quote_coverages",
            joinColumns = @JoinColumn(name = "quote_id", nullable = false))
    private List<QuoteCoverage> coverages = new ArrayList<>();
    @Embedded
    private Premium premium;
}