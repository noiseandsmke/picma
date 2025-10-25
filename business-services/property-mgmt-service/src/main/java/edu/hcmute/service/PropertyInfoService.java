package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;

import java.util.List;

public interface PropertyInfoService {
    PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto);

    PropertyInfoDto getPropertyInfoById(String id);

    List<PropertyInfoDto> getPropertiesByZipCode(String zipcode);

    List<PropertyInfoDto> getAllProperties();
}