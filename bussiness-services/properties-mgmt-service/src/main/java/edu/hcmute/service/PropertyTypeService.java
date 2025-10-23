package edu.hcmute.service;

import edu.hcmute.dto.PropertyTypeDto;

import java.util.List;

public interface PropertyTypeService {
    PropertyTypeDto createPropertyType(PropertyTypeDto propertyType);

    PropertyTypeDto getPropertyById(String id);

    List<PropertyTypeDto> getAllPropertyTypes();
}