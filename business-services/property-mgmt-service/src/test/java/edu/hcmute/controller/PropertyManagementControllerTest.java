package edu.hcmute.controller;

import edu.hcmute.domain.ConstructionType;
import edu.hcmute.domain.OccupancyType;
import edu.hcmute.dto.PropertyAttributesDto;
import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.dto.PropertyLocationDto;
import edu.hcmute.dto.PropertyValuationDto;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyManagementControllerTest {

    @Mock
    private PropertyInfoService propertyInfoService;

    @InjectMocks
    private PropertyManagementController propertyManagementController;

    private PropertyInfoDto createSampleDto() {
        return new PropertyInfoDto(
                "1",
                new PropertyLocationDto("123 Main St", "Ward 1", "Ho Chi Minh", "70000"),
                new PropertyAttributesDto(ConstructionType.CONCRETE, OccupancyType.RESIDENTIAL, 2020, 3, 85.5),
                new PropertyValuationDto(2500000000L)
        );
    }

    @Test
    void savePropertyInfo_shouldReturnCreatedProperty() {
        PropertyInfoDto inputDto = new PropertyInfoDto(
                null,
                new PropertyLocationDto("123 Main St", "Ward 1", "Ho Chi Minh", "70000"),
                new PropertyAttributesDto(ConstructionType.CONCRETE, OccupancyType.RESIDENTIAL, 2020, 3, 85.5),
                new PropertyValuationDto(2500000000L)
        );
        PropertyInfoDto returnedDto = createSampleDto();
        when(propertyInfoService.createPropertyInfo(any(PropertyInfoDto.class))).thenReturn(returnedDto);
        ResponseEntity<PropertyInfoDto> response = propertyManagementController.savePropertyInfo(inputDto);
        assertNotNull(response);
        assertEquals(201, response.getStatusCode().value());
        assertEquals(returnedDto, response.getBody());
    }

    @Test
    void getAllPropertiesInfo_shouldReturnListOfProperties() {
        List<PropertyInfoDto> propertiesList = Collections.singletonList(createSampleDto());
        when(propertyInfoService.getAllProperties(null, "asc")).thenReturn(propertiesList);
        ResponseEntity<List<PropertyInfoDto>> response = propertyManagementController.getAllPropertiesInfo(null, "asc");
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getPropertyById_shouldReturnProperty() {
        PropertyInfoDto propertyDto = createSampleDto();
        when(propertyInfoService.getPropertyInfoById("1")).thenReturn(propertyDto);
        ResponseEntity<PropertyInfoDto> response = propertyManagementController.getPropertyById("1");
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(propertyDto, response.getBody());
    }

    @Test
    void deletePropertyById_shouldReturnNoContent() {
        doNothing().when(propertyInfoService).deletePropertyById("1");
        ResponseEntity<Void> response = propertyManagementController.deletePropertyById("1");
        assertNotNull(response);
        assertEquals(204, response.getStatusCode().value());
        verify(propertyInfoService).deletePropertyById("1");
    }
}