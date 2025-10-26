package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PerilType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true)
    private String type;
}