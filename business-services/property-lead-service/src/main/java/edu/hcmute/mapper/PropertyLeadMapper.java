package edu.hcmute.mapper;

import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.PropertyLead;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PropertyLeadMapper {

    PropertyLeadDto toDto(PropertyLead propertyLead);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createDate", ignore = true)
    @Mapping(target = "expiryDate", ignore = true)
    PropertyLead toEntity(PropertyLeadDto propertyLeadDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createDate", ignore = true)
    @Mapping(target = "expiryDate", ignore = true)
    void updateEntity(@MappingTarget PropertyLead propertyLead, PropertyLeadDto propertyLeadDto);
}
