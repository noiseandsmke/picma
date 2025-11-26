package edu.hcmute.mapper;

import edu.hcmute.dto.*;
import edu.hcmute.entity.*;
import edu.hcmute.repo.CoverageTypeRepo;
import edu.hcmute.repo.PolicyTypeRepo;
import edu.hcmute.repo.PropertyQuoteRepo;
import edu.hcmute.repo.QuoteTypeRepo;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@RequiredArgsConstructor
@NoArgsConstructor(force = true)
@Mapper(componentModel = "spring")
public abstract class PropertyQuoteMapper {
    protected final PropertyQuoteRepo propertyQuoteRepo;
    protected final QuoteTypeRepo quoteTypeRepo;
    protected final CoverageTypeRepo coverageTypeRepo;
    protected final PolicyTypeRepo policyTypeRepo;

    public abstract PropertyQuoteDto toDto(PropertyQuote propertyQuote);

    public abstract PropertyQuote toEntity(PropertyQuoteDto propertyQuoteDto);

    @Mapping(target = "propertyQuote", source = "propertyQuoteDto", qualifiedByName = "resolvePropertyQuote")
    @Mapping(target = "quoteType", source = "quoteTypeDto", qualifiedByName = "resolveQuoteType")
    @Mapping(target = "coverageType", source = "coverageTypeDto", qualifiedByName = "resolveCoverageType")
    @Mapping(target = "policyType", source = "policyTypeDto", qualifiedByName = "resolvePolicyType")
    public abstract PropertyQuoteDetail toEntity(PropertyQuoteDetailDto propertyQuoteDetailDto);

    @Named("resolvePropertyQuote")
    protected PropertyQuote resolvePropertyQuote(PropertyQuoteDto dto) {
        if (dto == null) {
            return null;
        }
        if (dto.id() != null) {
            return propertyQuoteRepo.findById(dto.id())
                    .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + dto.id()));
        }
        PropertyQuote propertyQuote = PropertyQuote.builder()
                .leadId(dto.leadId())
                .build();
        return propertyQuoteRepo.save(propertyQuote);
    }

    @Named("resolveQuoteType")
    protected QuoteType resolveQuoteType(QuoteTypeDto dto) {
        if (dto == null || dto.id() == null) return null;
        return quoteTypeRepo.findById(dto.id()).orElseThrow(() -> new RuntimeException("QuoteType not found"));
    }

    @Named("resolveCoverageType")
    protected CoverageType resolveCoverageType(CoverageTypeDto dto) {
        if (dto == null || dto.id() == null) return null;
        return coverageTypeRepo.findById(dto.id()).orElseThrow(() -> new RuntimeException("CoverageType not found"));
    }

    @Named("resolvePolicyType")
    protected PolicyType resolvePolicyType(PolicyTypeDto dto) {
        if (dto == null || dto.id() == null) return null;
        return policyTypeRepo.findById(dto.id()).orElseThrow(() -> new RuntimeException("PolicyType not found"));
    }

    @Mapping(source = "propertyQuote", target = "propertyQuoteDto")
    @Mapping(source = "quoteType", target = "quoteTypeDto")
    @Mapping(source = "coverageType", target = "coverageTypeDto")
    @Mapping(source = "policyType", target = "policyTypeDto")
    @Mapping(target = "leadId", source = "propertyQuote.leadId")
    @Mapping(target = "leadInfo", ignore = true)
    public abstract PropertyQuoteDetailDto toDto(PropertyQuoteDetail propertyQuoteDetail);

    public abstract QuoteTypeDto toDto(QuoteType quoteType);

    public abstract QuoteType toEntity(QuoteTypeDto quoteTypeDto);

    public abstract CoverageType toEntity(CoverageTypeDto coverageTypeDto);

    public abstract CoverageTypeDto toDto(CoverageType coverageType);

    public abstract PerilTypeDto toDto(PerilType perilType);

    public abstract PerilType toEntity(PerilTypeDto perilTypeDto);

    @Mapping(source = "coverageTypeDto", target = "coverageType")
    public abstract PolicyType toEntity(PolicyTypeDto policyTypeDto);

    @Mapping(source = "coverageType", target = "coverageTypeDto")
    public abstract PolicyTypeDto toDto(PolicyType policyType);
}
