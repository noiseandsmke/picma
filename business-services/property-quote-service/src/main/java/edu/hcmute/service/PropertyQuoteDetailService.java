package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDetailDto;

import java.util.List;

public interface PropertyQuoteDetailService {
    PropertyQuoteDetailDto createPropertyQuoteDetail(PropertyQuoteDetailDto propertyQuoteDetailDto);

    PropertyQuoteDetailDto getPropertyQuoteDetailById(Integer id);

    List<PropertyQuoteDetailDto> getAllPropertyQuoteDetail(String sort, String order);

    PropertyQuoteDetailDto updatePropertyQuoteDetail(Integer id, PropertyQuoteDetailDto propertyQuoteDetailDto);

    void deletePropertyQuoteDetailById(Integer id);
}