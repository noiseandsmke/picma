package edu.hcmute.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class CoverageType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String type;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "coverage_peril_type",
            joinColumns = @JoinColumn(name = "coverage_type_id"),
            inverseJoinColumns = @JoinColumn(name = "peril_type_id")
    )
    private List<PerilType> perilTypeList;
}