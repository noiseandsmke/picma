package edu.hcmute.service;

import edu.hcmute.dto.PropertyTypeDto;
import edu.hcmute.model.PropertyType;
import edu.hcmute.repo.PropertyTypeRepo;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class PropertyTypeServiceImpl implements PropertyTypeService {
    private PropertyTypeRepo propertyTypeRepo;
    private ModelMapper modelMapper;

    public PropertyTypeServiceImpl(PropertyTypeRepo propertyTypeRepo, ModelMapper modelMapper) {
        this.propertyTypeRepo = propertyTypeRepo;
        this.modelMapper = modelMapper;
    }

    @Override
    public PropertyTypeDto createPropertyType(PropertyTypeDto propertyTypeDto) {
        log.info("### Creating property type bean ###");
        log.info("PropertyTypeDto: {}", propertyTypeDto.toString());
        PropertyType propertyType = modelMapper.map(propertyTypeDto, PropertyType.class);
        try {
            propertyType = propertyTypeRepo.save(propertyType);
            log.info("### Creating property type ###");
            log.info("PropertyType Id: {}", propertyType.getId());
            if (StringUtils.hasText(propertyType.getId())) {
                return modelMapper.map(propertyType, PropertyTypeDto.class);
            } else {
                throw new RuntimeException("Issue when creating PropertyTypeDto");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public PropertyTypeDto getPropertyTypeById(String id) {
        log.info("### Getting property type by id ###");
        log.info("PropertyTypeBean Id: {}", id);
        if (StringUtils.hasText(id)) {
            return modelMapper.map(propertyTypeRepo.findById(id), PropertyTypeDto.class);
        } else {
            throw new RuntimeException("Provided Id is invalid");
        }
    }
}