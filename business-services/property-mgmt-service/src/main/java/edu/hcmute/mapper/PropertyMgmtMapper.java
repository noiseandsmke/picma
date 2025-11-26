package edu.hcmute.mapper;

import edu.hcmute.dto.PropertyAttributesDto;
import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.dto.PropertyLocationDto;
import edu.hcmute.dto.PropertyValuationDto;
import edu.hcmute.entity.PropertyAttributes;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.entity.PropertyLocation;
import edu.hcmute.entity.PropertyValuation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PropertyMgmtMapper {
    PropertyInfoDto toDto(PropertyInfo propertyInfo);

    @Mapping(target = "id", ignore = true)
    PropertyInfo toEntity(PropertyInfoDto propertyInfoDto);

    PropertyLocationDto toDto(PropertyLocation location);

    PropertyLocation toEntity(PropertyLocationDto locationDto);

    PropertyAttributesDto toDto(PropertyAttributes attributes);

    PropertyAttributes toEntity(PropertyAttributesDto attributesDto);

    PropertyValuationDto toDto(PropertyValuation valuation);

    PropertyValuation toEntity(PropertyValuationDto valuationDto);
}
