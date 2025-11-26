package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.mapper.PropertyMgmtMapper;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
                .orElseThrow(() -> new RuntimeException("PropertyInfo not found with id: " + id));
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
    public List<PropertyInfoDto> getAllProperties() {
        log.info("### Get All Properties ###");
        List<PropertyInfo> properties = propertyInfoRepo.findAll();
        if (properties.isEmpty()) {
            log.warn("~~> No properties found");
            return List.of();
        }
        log.info("~~> Found {} properties", properties.size());
        return properties.stream().map(propertyMgmtMapper::toDto).toList();
    }

    @Override
    public void deletePropertyById(String id) {
        log.info("### Delete PropertyInfo by id = {} ###", id);
        if (!propertyInfoRepo.existsById(id)) {
            throw new RuntimeException("PropertyInfo not found with id: " + id);
        }
        propertyInfoRepo.deleteById(id);
        log.info("~~> PropertyInfo deleted with id: {}", id);
    }
}
