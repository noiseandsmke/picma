package edu.hcmute.service;

import edu.hcmute.domain.ConstructionType;
import edu.hcmute.domain.OccupancyType;
import edu.hcmute.dto.PropertyAttributesDto;
import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.dto.PropertyLocationDto;
import edu.hcmute.dto.PropertyValuationDto;
import edu.hcmute.entity.PropertyAttributes;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.entity.PropertyLocation;
import edu.hcmute.entity.PropertyValuation;
import edu.hcmute.mapper.PropertyMgmtMapper;
import edu.hcmute.repo.PropertyInfoRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyInfoServiceImplTest {

    @Mock
    private PropertyInfoRepo propertyInfoRepo;
    @Mock
    private PropertyMgmtMapper propertyMgmtMapper;

    @InjectMocks
    private PropertyInfoServiceImpl propertyInfoService;

    private PropertyInfoDto createSampleDto() {
        return new PropertyInfoDto(
                "1",
                "user1",
                new PropertyLocationDto("123 Main St", "Ward 1", "Ho Chi Minh", "70000"),
                new PropertyAttributesDto(ConstructionType.CONCRETE, OccupancyType.RESIDENTIAL, 2020, 3, 85.5),
                new PropertyValuationDto(2500000000L)
        );
    }

    private PropertyInfo createSampleEntity() {
        PropertyInfo entity = new PropertyInfo();
        entity.setId("1");
        entity.setUserId("user1");
        entity.setLocation(new PropertyLocation("123 Main St", "Ward 1", "Ho Chi Minh", "70000"));
        entity.setAttributes(new PropertyAttributes(ConstructionType.CONCRETE, OccupancyType.RESIDENTIAL, 2020, 3, 85.5));
        entity.setValuation(new PropertyValuation(2500000000L));
        return entity;
    }

    @Test
    void createPropertyInfo_success() {
        PropertyInfoDto inputDto = new PropertyInfoDto(
                null,
                "user1",
                new PropertyLocationDto("123 Main St", "Ward 1", "Ho Chi Minh", "70000"),
                new PropertyAttributesDto(ConstructionType.CONCRETE, OccupancyType.RESIDENTIAL, 2020, 3, 85.5),
                new PropertyValuationDto(2500000000L)
        );
        PropertyInfo entity = createSampleEntity();
        PropertyInfoDto resultDto = createSampleDto();
        when(propertyMgmtMapper.toEntity(inputDto)).thenReturn(entity);
        when(propertyInfoRepo.save(entity)).thenReturn(entity);
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);
        PropertyInfoDto result = propertyInfoService.createPropertyInfo(inputDto);
        assertNotNull(result);
        assertEquals("1", result.id());
        assertEquals(ConstructionType.CONCRETE, result.attributes().constructionType());
        assertEquals(OccupancyType.RESIDENTIAL, result.attributes().occupancyType());
        verify(propertyInfoRepo).save(entity);
    }

    @Test
    void getPropertyInfoById_success() {
        PropertyInfo entity = createSampleEntity();
        PropertyInfoDto resultDto = createSampleDto();
        when(propertyInfoRepo.findById("1")).thenReturn(Optional.of(entity));
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);
        PropertyInfoDto result = propertyInfoService.getPropertyInfoById("1");
        assertNotNull(result);
        assertEquals("1", result.id());
    }

    @Test
    void getPropertyInfoById_notFound() {
        when(propertyInfoRepo.findById("1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> propertyInfoService.getPropertyInfoById("1"));
    }

    @Test
    void getPropertiesByZipCode_success() {
        PropertyInfo entity = createSampleEntity();
        PropertyInfoDto resultDto = createSampleDto();
        when(propertyInfoRepo.findPropertiesByZipCode("70000")).thenReturn(Collections.singletonList(entity));
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);
        List<PropertyInfoDto> result = propertyInfoService.getPropertiesByZipCode("70000");
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void deletePropertyById_success() {
        when(propertyInfoRepo.existsById("1")).thenReturn(true);
        doNothing().when(propertyInfoRepo).deleteById("1");
        assertDoesNotThrow(() -> propertyInfoService.deletePropertyById("1"));
        verify(propertyInfoRepo).deleteById("1");
    }
}