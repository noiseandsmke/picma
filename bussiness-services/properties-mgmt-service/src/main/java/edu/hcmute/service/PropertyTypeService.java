package edu.hcmute.service;

import edu.hcmute.dto.PropertyTypeDto;

public interface PropertyTypeService {
    PropertyTypeDto createPropertyType(PropertyTypeDto propertyType);

    PropertyTypeDto getPropertyById(String id);
}