package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.mapper.PropertyMgmtMapper;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyInfoServiceImpl implements PropertyInfoService {
    private final PropertyInfoRepo propertyInfoRepo;
    private final PropertyMgmtMapper propertyMgmtMapper;

    @Override
    public PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto) {
        log.info("### Create propertyInfo ###");
        PropertyInfo propertyInfo = propertyMgmtMapper.toEntity(propertyInfoDto);
        propertyInfo = propertyInfoRepo.save(propertyInfo);
        log.info("~~> propertyInfo saved with id: {}", propertyInfo.getId());
        return propertyMgmtMapper.toDto(propertyInfo);
    }

    @Override
    public PropertyInfoDto getPropertyInfoById(String id) {
        log.info("### Get propertyInfo by id = {} ###", id);
        PropertyInfo propertyInfo = propertyInfoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PropertyInfo not found with id: " + id));
        return propertyMgmtMapper.toDto(propertyInfo);
    }

    @Override
    public List<PropertyInfoDto> getAllProperties(String sortBy, String sortDirection) {
        log.info("### Get all propertyInfos sorted by {} {} ###", sortBy, sortDirection);
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Sort sort = Sort.by(direction, sortBy);
        List<PropertyInfo> properties = propertyInfoRepo.findAll(sort);
        if (properties.isEmpty()) {
            log.warn("~~> no properties found");
            return List.of();
        }
        log.info("~~> found {} properties", properties.size());
        return properties.stream().map(propertyMgmtMapper::toDto).toList();
    }

    @Override
    public PropertyInfoDto updatePropertyInfo(String id, PropertyInfoDto propertyInfoDto) {
        log.info("### Update PropertyInfo with id: {} ###", id);
        PropertyInfo existingProperty = propertyInfoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PropertyInfo not found with id: " + id));
        propertyMgmtMapper.updateEntity(existingProperty, propertyInfoDto);
        existingProperty = propertyInfoRepo.save(existingProperty);
        log.info("~~> PropertyInfo updated with id: {}", existingProperty.getId());
        return propertyMgmtMapper.toDto(existingProperty);
    }

    @Override
    public List<PropertyInfoDto> getPropertiesByUserId(String userId) {
        log.info("### Get properties by userId = {} ###", userId);
        List<PropertyInfo> properties = propertyInfoRepo.findByUserId(userId);
        if (properties.isEmpty()) {
            log.warn("~~> no properties found for userId: {}", userId);
            return List.of();
        }
        log.info("~~> found {} properties for userId: {}", properties.size(), userId);
        return properties.stream().map(propertyMgmtMapper::toDto).toList();
    }

    @Override
    public void deletePropertyById(String id) {
        log.info("### Delete propertyInfo by id = {} ###", id);
        if (!propertyInfoRepo.existsById(id)) {
            throw new IllegalArgumentException("PropertyInfo not found with id: " + id);
        }
        propertyInfoRepo.deleteById(id);
        log.info("~~> propertyInfo deleted with id: {}", id);
    }
}