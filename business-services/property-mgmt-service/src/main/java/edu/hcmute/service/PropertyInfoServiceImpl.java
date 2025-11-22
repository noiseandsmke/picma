package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.mapper.PropertyMgmtMapper;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.List;

@Service
@Slf4j
@AllArgsConstructor
public class PropertyInfoServiceImpl implements PropertyInfoService {
    private PropertyInfoRepo propertyInfoRepo;
    private PropertyMgmtMapper propertyMgmtMapper;

    @Override
    public PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto) {
        PropertyInfo propertyInfo = propertyMgmtMapper.toEntity(propertyInfoDto);
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
    public List<PropertyInfoDto> getPropertiesByZipCode(String zipcode) {
        try {
            List<PropertyInfo> propertiesInfo = propertyInfoRepo.findPropertiesByZipCode(zipcode);
            if (!CollectionUtils.isEmpty(propertiesInfo) && !propertiesInfo.isEmpty()) {
                return propertiesInfo.stream().map(this::mapModelToDto).toList();
            } else {
                throw new RuntimeException("No properties found within zipcode = " + zipcode);
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
        return propertyMgmtMapper.toDto(propertyInfo);
    }
}