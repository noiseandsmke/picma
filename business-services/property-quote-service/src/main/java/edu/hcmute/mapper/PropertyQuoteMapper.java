package edu.hcmute.mapper;

import edu.hcmute.dto.CoverageDto;
import edu.hcmute.dto.CreatePropertyQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.UpdatePropertyQuoteDto;
import edu.hcmute.entity.Coverage;
import edu.hcmute.entity.PropertyQuote;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PropertyQuoteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sumInsured", ignore = true)
    @Mapping(target = "premium", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "validUntil", ignore = true)
    PropertyQuote toEntity(CreatePropertyQuoteDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "leadId", ignore = true)
    @Mapping(target = "agentId", ignore = true)
    @Mapping(target = "sumInsured", ignore = true)
    @Mapping(target = "premium", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "validUntil", ignore = true)
    void updateEntity(@MappingTarget PropertyQuote entity, UpdatePropertyQuoteDto dto);

    PropertyQuoteDto toDto(PropertyQuote entity);

    @Mapping(target = "coverageLimit", source = "limit")
    Coverage toCoverage(CoverageDto dto);

    @Mapping(target = "limit", source = "coverageLimit")
    CoverageDto toCoverageDto(Coverage entity);
}