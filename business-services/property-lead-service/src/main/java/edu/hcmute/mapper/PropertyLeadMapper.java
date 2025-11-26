package edu.hcmute.mapper;

import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.PropertyLead;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PropertyLeadMapper {
    PropertyLeadDto toDto(PropertyLead propertyLead);

    PropertyLead toEntity(PropertyLeadDto propertyLeadDto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget PropertyLead propertyLead, PropertyLeadDto propertyLeadDto);
}
