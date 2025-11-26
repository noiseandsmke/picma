package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "property_quote")
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
    private LocalDate createDate;

    private LocalDate expiryDate;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = LocalDate.now();
        }
        if (expiryDate == null) {
            expiryDate = LocalDate.now().plusDays(60);
        }
    }
}
