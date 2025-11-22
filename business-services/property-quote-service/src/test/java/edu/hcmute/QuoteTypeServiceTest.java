package edu.hcmute;

import edu.hcmute.dto.QuoteTypeDto;
import edu.hcmute.entity.QuoteType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.QuoteTypeRepo;
import edu.hcmute.service.QuoteTypeServiceImpl;
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
public class QuoteTypeServiceTest {
    @Mock
    private QuoteTypeRepo quoteTypeRepo;

    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private QuoteTypeServiceImpl service;

    private QuoteTypeDto quoteTypeDto;
    private QuoteType quoteType;

    @BeforeEach
    public void init() {
        quoteTypeDto = new QuoteTypeDto();
        quoteTypeDto.setType("Full application");

        quoteType = new QuoteType();
        quoteType.setId(1);
        quoteType.setType("Full application");
    }

    @Test
    void createQuoteTypeTest() {
        when(propertyQuoteMapper.toEntity(any(QuoteTypeDto.class))).thenReturn(quoteType);
        when(quoteTypeRepo.save(any(QuoteType.class))).thenReturn(quoteType);
        when(propertyQuoteMapper.toDto(any(QuoteType.class))).thenReturn(quoteTypeDto);
        quoteTypeDto.setId(1);

        QuoteTypeDto savedQuoteTypeDto = service.createQuoteType(quoteTypeDto);
        Assertions.assertNotNull(savedQuoteTypeDto);
        Assertions.assertEquals(1, savedQuoteTypeDto.getId());
        Assertions.assertEquals(quoteTypeDto.getType(), savedQuoteTypeDto.getType());
    }
}