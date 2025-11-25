package edu.hcmute.controller;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.service.PropertyInfoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyManagementControllerTest {

    @Mock
    private PropertyInfoService propertyInfoService;

    @InjectMocks
    private PropertyManagementController propertyManagementController;

    @Test
    void savePropertyInfo_shouldReturnCreatedProperty() {
        PropertyInfoDto inputDto = new PropertyInfoDto(null, null, 0, 0, null, null, null, null, null, null, null);
        PropertyInfoDto returnedDto = new PropertyInfoDto("1", null, 0, 0, null, null, null, null, null, null, null);

        when(propertyInfoService.createPropertyInfo(any(PropertyInfoDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyInfoDto> response = propertyManagementController.savePropertyInfo(inputDto);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(returnedDto, response.getBody());
        verify(propertyInfoService).createPropertyInfo(inputDto);
    }

    @Test
    void getAllPropertiesInfo_shouldReturnListOfProperties() {
        PropertyInfoDto propertyDto = new PropertyInfoDto("1", null, 0, 0, null, null, null, null, null, null, null);
        List<PropertyInfoDto> propertiesList = Collections.singletonList(propertyDto);

        when(propertyInfoService.getAllProperties()).thenReturn(propertiesList);

        ResponseEntity<List<PropertyInfoDto>> response = propertyManagementController.getAllPropertiesInfo();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(propertiesList, response.getBody());
        verify(propertyInfoService).getAllProperties();
    }

    @Test
    void getPropertyById_shouldReturnProperty() {
        String propertyId = "1";
        PropertyInfoDto propertyDto = new PropertyInfoDto(propertyId, null, 0, 0, null, null, null, null, null, null, null);

        when(propertyInfoService.getPropertyInfoById(propertyId)).thenReturn(propertyDto);

        ResponseEntity<PropertyInfoDto> response = propertyManagementController.getPropertyById(propertyId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(propertyDto, response.getBody());
        verify(propertyInfoService).getPropertyInfoById(propertyId);
    }

    @Test
    void getPropertyByZipCode_shouldReturnListOfProperties() {
        String zipcode = "12345";
        PropertyInfoDto propertyDto = new PropertyInfoDto("1", null, 0, 0, null, null, null, null, null, null, null);
        List<PropertyInfoDto> propertiesList = Collections.singletonList(propertyDto);

        when(propertyInfoService.getPropertiesByZipCode(zipcode)).thenReturn(propertiesList);

        ResponseEntity<List<PropertyInfoDto>> response = propertyManagementController.getPropertyByZipCode(zipcode);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(propertiesList, response.getBody());
        verify(propertyInfoService).getPropertiesByZipCode(zipcode);
    }
}