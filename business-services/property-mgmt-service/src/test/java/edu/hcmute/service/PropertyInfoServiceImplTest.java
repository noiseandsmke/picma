package edu.hcmute.service;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.entity.PropertyInfo;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyInfoServiceImplTest {

    @Mock
    private PropertyInfoRepo propertyInfoRepo;
    @Mock
    private PropertyMgmtMapper propertyMgmtMapper;

    @InjectMocks
    private PropertyInfoServiceImpl propertyInfoService;

    @Test
    void createPropertyInfo_success() {
        PropertyInfoDto inputDto = new PropertyInfoDto(null, null, 0, 0, null, null, null, null, null, null, null);
        PropertyInfo entity = new PropertyInfo();
        PropertyInfoDto resultDto = new PropertyInfoDto("1", null, 0, 0, null, null, null, null, null, null, null);

        when(propertyMgmtMapper.toEntity(inputDto)).thenReturn(entity);
        when(propertyInfoRepo.save(entity)).thenReturn(entity);
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);

        PropertyInfoDto result = propertyInfoService.createPropertyInfo(inputDto);

        assertNotNull(result);
        assertEquals("1", result.id());
        verify(propertyInfoRepo).save(entity);
    }

    @Test
    void getPropertyInfoById_success() {
        String id = "1";
        PropertyInfo entity = new PropertyInfo();
        PropertyInfoDto resultDto = new PropertyInfoDto(id, null, 0, 0, null, null, null, null, null, null, null);

        when(propertyInfoRepo.findById(id)).thenReturn(Optional.of(entity));
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);

        PropertyInfoDto result = propertyInfoService.getPropertyInfoById(id);

        assertNotNull(result);
        assertEquals(id, result.id());
    }

    @Test
    void getPropertyInfoById_notFound() {
        String id = "1";
        when(propertyInfoRepo.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> propertyInfoService.getPropertyInfoById(id));
    }

    @Test
    void getPropertiesByZipCode_success() {
        String zipcode = "12345";
        PropertyInfo entity = new PropertyInfo();
        PropertyInfoDto resultDto = new PropertyInfoDto("1", null, 0, 0, null, null, null, null, null, null, null);

        when(propertyInfoRepo.findPropertiesByZipCode(zipcode)).thenReturn(Collections.singletonList(entity));
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);

        List<PropertyInfoDto> result = propertyInfoService.getPropertiesByZipCode(zipcode);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getPropertiesByZipCode_notFound() {
        String zipcode = "12345";
        when(propertyInfoRepo.findPropertiesByZipCode(zipcode)).thenReturn(Collections.emptyList());

        assertThrows(RuntimeException.class, () -> propertyInfoService.getPropertiesByZipCode(zipcode));
    }

    @Test
    void getAllProperties_success() {
        PropertyInfo entity = new PropertyInfo();
        PropertyInfoDto resultDto = new PropertyInfoDto("1", null, 0, 0, null, null, null, null, null, null, null);

        when(propertyInfoRepo.findAll()).thenReturn(Collections.singletonList(entity));
        when(propertyMgmtMapper.toDto(entity)).thenReturn(resultDto);

        List<PropertyInfoDto> result = propertyInfoService.getAllProperties();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getAllProperties_empty() {
        when(propertyInfoRepo.findAll()).thenReturn(Collections.emptyList());
        assertThrows(RuntimeException.class, () -> propertyInfoService.getAllProperties());
    }
}