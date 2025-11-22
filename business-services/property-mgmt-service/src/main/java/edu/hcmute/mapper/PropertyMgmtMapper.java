package edu.hcmute.mapper;

import edu.hcmute.dto.*;
import edu.hcmute.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PropertyMgmtMapper {
    @Mapping(source = "propertyType", target = "propertyTypeDto")
    @Mapping(source = "propertyAddress", target = "propertyAddressDto")
    @Mapping(source = "constructionType", target = "constructionTypeDto")
    @Mapping(source = "occupancyType", target = "occupancyTypeDto")
    PropertyInfoDto toDto(PropertyInfo propertyInfo);

    @Mapping(source = "propertyTypeDto", target = "propertyType")
    @Mapping(source = "propertyAddressDto", target = "propertyAddress")
    @Mapping(source = "constructionTypeDto", target = "constructionType")
    @Mapping(source = "occupancyTypeDto", target = "occupancyType")
    PropertyInfo toEntity(PropertyInfoDto propertyInfoDto);

    PropertyTypeDto toDto(PropertyType propertyType);

    PropertyAddressDto toDto(PropertyAddress propertyAddress);

    ConstructionTypeDto toDto(ConstructionType constructionType);

    OccupancyTypeDto toDto(OccupancyType occupancyType);
}