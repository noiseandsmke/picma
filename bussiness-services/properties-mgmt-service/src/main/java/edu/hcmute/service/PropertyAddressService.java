package edu.hcmute.service;

import edu.hcmute.dto.PropertyAddressDto;

import java.util.List;

public interface PropertyAddressService {
    PropertyAddressDto addUpdatePropertyAddress(PropertyAddressDto propertyAddressDto);

    List<PropertyAddressDto> fetchPropertyAddressesByZipCode(String zipCode);
}