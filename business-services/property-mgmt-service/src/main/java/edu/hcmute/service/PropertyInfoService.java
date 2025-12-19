package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;

import java.util.List;

public interface PropertyInfoService {
    PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto);

    PropertyInfoDto getPropertyInfoById(String id);

    List<PropertyInfoDto> getAllProperties(String sortBy, String sortDirection);

    List<PropertyInfoDto> getPropertiesByUserId(String userId);

    PropertyInfoDto updatePropertyInfo(String id, PropertyInfoDto propertyInfoDto);

    void deletePropertyById(String id);
}