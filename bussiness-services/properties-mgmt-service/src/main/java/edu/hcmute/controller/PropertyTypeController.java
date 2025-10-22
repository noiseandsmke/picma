package edu.hcmute.controller;

import edu.hcmute.dto.PropertyTypeDto;
import edu.hcmute.service.PropertyTypeService;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PropertyTypeController {
    private PropertyTypeService propertyTypeService;

    public PropertyTypeController(PropertyTypeService propertyTypeService) {
        this.propertyTypeService = propertyTypeService;
    }

    public List<PropertyTypeDto> getAllPropertyTypes() {
        return null;
    }
}