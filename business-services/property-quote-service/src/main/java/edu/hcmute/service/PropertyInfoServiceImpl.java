package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.repo.PropertyInfoRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyInfoServiceImpl implements PropertyInfoService {
    private final PropertyInfoRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public PropertyInfoDto createPropertyInfo(PropertyInfoDto propertyInfoDto) {
        log.info("### Create PropertyInfo ###");
        log.info("PropertyInfoDto: {}", propertyInfoDto.toString());
        try {
            PropertyInfo propertyInfo = modelMapper.map(propertyInfoDto, PropertyInfo.class);
            propertyInfo = repo.save(propertyInfo);
            log.info("PropertyInfo saved with id: {}", propertyInfo.getId());
            return mapModelToDto(propertyInfo);
        } catch (Exception e) {
            log.error("Error creating PropertyInfo: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public PropertyInfoDto getPropertyInfoById(Integer id) {
        log.info("### Get PropertyInfo by Id ###");
        log.info("PropertyInfoDto id: {}", id);
        PropertyInfo propertyInfo = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PropertyInfo found with id: {}", id);
                    return new RuntimeException("No PropertyInfo found with id: " + id);
                });
        return mapModelToDto(propertyInfo);
    }

    @Override
    public List<PropertyInfoDto> getAllPropertyInfos() {
        log.info("### Get All PropertyInfos ###");
        List<PropertyInfo> propertyInfoList = repo.findAll();
        if (propertyInfoList.isEmpty()) {
            log.warn("No PropertyInfos found in database");
            throw new RuntimeException("No PropertyInfos found in database");
        }
        log.info("Found {} PropertyInfos", propertyInfoList.size());
        return propertyInfoList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private PropertyInfoDto mapModelToDto(PropertyInfo propertyInfo) {
        return modelMapper.map(propertyInfo, PropertyInfoDto.class);
    }
}