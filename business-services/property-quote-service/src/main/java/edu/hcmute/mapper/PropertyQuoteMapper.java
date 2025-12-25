package edu.hcmute.mapper;

import edu.hcmute.dto.CoverageDto;
import edu.hcmute.dto.CreateQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.UpdateQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.entity.QuoteCoverage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PropertyQuoteMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "premium", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createDate", ignore = true)
    PropertyQuote toEntity(CreateQuoteDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "leadId", ignore = true)
    @Mapping(target = "agentId", ignore = true)
    @Mapping(target = "premium", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createDate", ignore = true)
    void updateEntity(@MappingTarget PropertyQuote entity, UpdateQuoteDto dto);

    @Mapping(target = "createdDate", source = "createDate")
    PropertyQuoteDto toDto(PropertyQuote entity);

    @Mapping(target = "coverageLimit", source = "limit")
    QuoteCoverage toQuoteCoverage(CoverageDto dto);

    @Mapping(target = "limit", source = "coverageLimit")
    CoverageDto toQuoteCoverageDto(QuoteCoverage entity);
}