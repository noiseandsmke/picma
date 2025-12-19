package edu.hcmute.mapper;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PropertyMgmtMapper {
    PropertyInfoDto toDto(PropertyInfo propertyInfo);

    @Mapping(target = "id", ignore = true)
    PropertyInfo toEntity(PropertyInfoDto propertyInfoDto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget PropertyInfo entity, PropertyInfoDto dto);
}