package edu.hcmute.service;

import edu.hcmute.dto.*;
import edu.hcmute.model.PropertyInfo;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

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
        PropertyInfoDto resPropertyInfoDto = modelMapper.map(propertyInfo, PropertyInfoDto.class);
        log.info("propertyInfo::getPropertyType = {}", propertyInfo.getPropertyType());
        if (propertyInfo.getPropertyType() != null) {
            resPropertyInfoDto.setPropertyTypeDto(modelMapper.map(propertyInfo.getPropertyType(), PropertyTypeDto.class));
        }
        log.info("propertyInfo::getConstructionType = {}", propertyInfo.getConstructionType());
        if (propertyInfo.getConstructionType() != null) {
            resPropertyInfoDto.setConstructionTypeDto(modelMapper.map(propertyInfo.getConstructionType(), ConstructionTypeDto.class));
        }
        if (propertyInfo.getOccupancyType() != null) {
            resPropertyInfoDto.setOccupancyTypeDto(modelMapper.map(propertyInfo.getOccupancyType(), OccupancyTypeDto.class));
        }
        if (propertyInfo.getPropertyAddress() != null) {
            resPropertyInfoDto.setPropertyAddressDto(modelMapper.map(propertyInfo.getPropertyAddress(), PropertyAddressDto.class));
        }
        log.info("PropertyInfoDto: {}", resPropertyInfoDto);
        return resPropertyInfoDto;
    }

    @Override
    public PropertyInfoDto getPropertyInfoById(String id) {
        return null;
    }

    @Override
    public List<PropertyInfoDto> getAllProperties() {
        return List.of();
    }
}