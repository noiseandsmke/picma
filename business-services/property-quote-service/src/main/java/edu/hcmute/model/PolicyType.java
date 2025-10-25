package edu.hcmute.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PolicyType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true)
    private String type;
    @ManyToOne(fetch = FetchType.EAGER)
    private CoverageType coverageType;
}