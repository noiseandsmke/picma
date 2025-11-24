package edu.hcmute;

import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import edu.hcmute.service.PropertyQuoteServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteServiceTest {
    @Mock
    private PropertyQuoteRepo propertyQuoteRepo;

    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PropertyQuoteServiceImpl service;

    private PropertyQuoteDto propertyQuoteDto;
    private PropertyQuote propertyQuote;

    @BeforeEach
    public void init() {
        propertyQuoteDto = new PropertyQuoteDto(null, "Duc Huy", "Honda Blade 110");

        propertyQuote = new PropertyQuote();
        propertyQuote.setId(1);
        propertyQuote.setUserInfo("Duc Huy");
        propertyQuote.setPropertyInfo("Honda Blade 110");
    }

    @Test
    void createPropertyQuoteTest() {
        when(propertyQuoteMapper.toEntity(any(PropertyQuoteDto.class))).thenReturn(propertyQuote);
        when(propertyQuoteRepo.save(any(PropertyQuote.class))).thenReturn(propertyQuote);

        PropertyQuoteDto resultDto = new PropertyQuoteDto(1, "Duc Huy", "Honda Blade 110");
        when(propertyQuoteMapper.toDto(any(PropertyQuote.class))).thenReturn(resultDto);

        PropertyQuoteDto savedPropertyQuoteDto = service.createPropertyQuote(propertyQuoteDto);
        Assertions.assertNotNull(savedPropertyQuoteDto);
        Assertions.assertEquals(1, savedPropertyQuoteDto.id());
    }
}