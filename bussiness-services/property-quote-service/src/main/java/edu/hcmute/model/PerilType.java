package edu.hcmute.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PerilType {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    @Column(nullable = false, unique = true)
    private String type;
}