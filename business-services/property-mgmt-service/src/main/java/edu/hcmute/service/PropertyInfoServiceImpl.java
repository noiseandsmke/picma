package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.mapper.PropertyMgmtMapper;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyInfoServiceImpl implements PropertyInfoService {

    private final PropertyInfoRepo propertyInfoRepo;
    private final PropertyMgmtMapper propertyMgmtMapper;

    @Override
    public PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto) {
        log.info("### Create PropertyInfo ###");
        PropertyInfo propertyInfo = propertyMgmtMapper.toEntity(propertyInfoDto);
        propertyInfo = propertyInfoRepo.save(propertyInfo);
        log.info("~~> PropertyInfo saved with id: {}", propertyInfo.getId());
        return propertyMgmtMapper.toDto(propertyInfo);
    }

    @Override
    public PropertyInfoDto getPropertyInfoById(String id) {
        log.info("### Get PropertyInfo by id = {} ###", id);
        PropertyInfo propertyInfo = propertyInfoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PropertyInfo not found with id: " + id));
        return propertyMgmtMapper.toDto(propertyInfo);
    }

    @Override
    public List<PropertyInfoDto> getPropertiesByZipCode(String zipcode) {
        log.info("### Get Properties by zipCode = {} ###", zipcode);
        List<PropertyInfo> properties = propertyInfoRepo.findPropertiesByZipCode(zipcode);
        if (properties.isEmpty()) {
            log.warn("~~> No properties found for zipCode: {}", zipcode);
            return List.of();
        }
        log.info("~~> Found {} properties for zipCode: {}", properties.size(), zipcode);
        return properties.stream().map(propertyMgmtMapper::toDto).toList();
    }

    @Override
    public List<PropertyInfoDto> getAllProperties(String sort, String direction) {
        log.info("### Get All Properties with sort: {}, direction: {} ###", sort, direction);
        List<PropertyInfo> properties;
        if (StringUtils.hasText(sort)) {
            Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
            properties = propertyInfoRepo.findAll(Sort.by(dir, sort));
        } else {
            properties = propertyInfoRepo.findAll();
        }
        if (properties.isEmpty()) {
            log.warn("~~> No properties found");
            return List.of();
        }
        log.info("~~> Found {} properties", properties.size());
        return properties.stream().map(propertyMgmtMapper::toDto).toList();
    }

    @Override
    public List<PropertyInfoDto> getPropertiesByUserId(String userId) {
        log.info("### Get Properties by userId = {} ###", userId);
        List<PropertyInfo> properties = propertyInfoRepo.findByUserId(userId);
        if (properties.isEmpty()) {
            log.warn("~~> No properties found for userId: {}", userId);
            return List.of();
        }
        log.info("~~> Found {} properties for userId: {}", properties.size(), userId);
        return properties.stream().map(propertyMgmtMapper::toDto).toList();
    }

    @Override
    public void deletePropertyById(String id) {
        log.info("### Delete PropertyInfo by id = {} ###", id);
        if (!propertyInfoRepo.existsById(id)) {
            throw new IllegalArgumentException("PropertyInfo not found with id: " + id);
        }
        propertyInfoRepo.deleteById(id);
        log.info("~~> PropertyInfo deleted with id: {}", id);
    }
}