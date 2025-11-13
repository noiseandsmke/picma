package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true)
    private String userId;
    @Column(nullable = false)
    private String zipCode;
    @Column(nullable = false)
    private String street;
    @Column(nullable = false)
    private String state;
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String country;
}