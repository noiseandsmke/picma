package edu.hcmute.service;

import edu.hcmute.dto.*;
import edu.hcmute.model.PropertyInfo;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.List;

@Service
@Slf4j
@AllArgsConstructor
public class PropertyInfoServiceImpl implements PropertyInfoService {
    private PropertyInfoRepo propertyInfoRepo;
    private ModelMapper modelMapper;

    @Override
    public PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto) {
        PropertyInfo propertyInfo = modelMapper.map(propertyInfoDto, PropertyInfo.class);
        log.info("PropertyInfo: {}", propertyInfo.toString());

        propertyInfo = propertyInfoRepo.save(propertyInfo);
        return mapModelToDto(propertyInfo);
    }

    @Override
    public PropertyInfoDto getPropertyInfoById(String id) {
        try {
            PropertyInfo propertyInfo = propertyInfoRepo.findById(id).orElseThrow();
            if (!ObjectUtils.isEmpty(propertyInfo)) {
                return mapModelToDto(propertyInfo);
            } else {
                throw new RuntimeException("Not found PropertyInfo with id = " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    @Override
    public List<PropertyInfoDto> getAllProperties() {
        try {
            List<PropertyInfo> propertiesInfo = propertyInfoRepo.findAll();
            if (!CollectionUtils.isEmpty(propertiesInfo) && !propertiesInfo.isEmpty()) {
                return propertiesInfo.stream().map(this::mapModelToDto).toList();
            } else {
                throw new RuntimeException("No properties found");
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    private PropertyInfoDto mapModelToDto(PropertyInfo propertyInfo) {
        PropertyInfoDto propertyInfoDto = modelMapper.map(propertyInfo, PropertyInfoDto.class);
        if (propertyInfo.getPropertyType() != null) {
            propertyInfoDto.setPropertyTypeDto(modelMapper.map(propertyInfo.getPropertyType(), PropertyTypeDto.class));
        }
        if (propertyInfo.getConstructionType() != null) {
            propertyInfoDto.setConstructionTypeDto(modelMapper.map(propertyInfo.getConstructionType(), ConstructionTypeDto.class));
        }
        if (propertyInfo.getOccupancyType() != null) {
            propertyInfoDto.setOccupancyTypeDto(modelMapper.map(propertyInfo.getOccupancyType(), OccupancyTypeDto.class));
        }
        if (propertyInfo.getPropertyAddress() != null) {
            propertyInfoDto.setPropertyAddressDto(modelMapper.map(propertyInfo.getPropertyAddress(), PropertyAddressDto.class));
        }
        return propertyInfoDto;
    }
}