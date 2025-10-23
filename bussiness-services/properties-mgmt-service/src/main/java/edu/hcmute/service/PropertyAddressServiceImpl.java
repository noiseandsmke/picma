package edu.hcmute.service;

import edu.hcmute.dto.PropertyAddressDto;
import edu.hcmute.model.PropertyAddress;
import edu.hcmute.repo.PropertyAddressRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class PropertyAddressServiceImpl implements PropertyAddressService {
    private PropertyAddressRepo propertyAddressRepo;
    private ModelMapper modelMapper;

    @Override
    public PropertyAddressDto addUpdatePropertyAddress(PropertyAddressDto propertyAddressDto) {
        try {
            log.info("### Add or update property address ###");
            PropertyAddress propertyAddress = modelMapper.map(propertyAddressDto, PropertyAddress.class);
            propertyAddress = propertyAddressRepo.save(propertyAddress);
            if (StringUtils.hasText(propertyAddress.getId())) {
                log.info("Creating property address with id: {}", propertyAddress.getId());
                return modelMapper.map(propertyAddress, PropertyAddressDto.class);
            } else {
                log.error("Cannot create property address with id: {}", propertyAddress.getId());
                throw new RuntimeException("Cannot create property address with id: " + propertyAddress.getId());
            }
        } catch (Exception e) {
            log.error(e.getLocalizedMessage());
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    @Override
    public List<PropertyAddressDto> fetchPropertyAddressesByZipCode(String zipCode) {
        return List.of();
    }
}