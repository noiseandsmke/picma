package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;

import java.util.List;

public interface PropertyInfoService {
    PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto);

    PropertyInfoDto getPropertyInfoById(Integer id);

    List<PropertyInfoDto> getAllPropertyInfos();
}