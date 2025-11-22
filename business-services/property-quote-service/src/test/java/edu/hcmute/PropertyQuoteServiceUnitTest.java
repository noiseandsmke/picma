package edu.hcmute;

import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import edu.hcmute.service.PropertyQuoteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteServiceUnitTest {

    @Mock
    private PropertyQuoteRepo propertyQuoteRepo;

    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PropertyQuoteServiceImpl propertyQuoteService;

    @BeforeEach
    public void setUp() {
        propertyQuoteService = new PropertyQuoteServiceImpl(
                propertyQuoteRepo,
                propertyQuoteMapper
        );
    }

    @Test
    public void testCreatePropertyQuote_Success() {
        PropertyQuoteDto inputDto = new PropertyQuoteDto();
        inputDto.setPropertyInfo("prop-123");
        inputDto.setUserInfo("user-1");

        PropertyQuote savedQuote = new PropertyQuote();
        savedQuote.setId(10);
        savedQuote.setPropertyInfo("prop-123");
        savedQuote.setUserInfo("user-1");

        when(propertyQuoteMapper.toEntity(inputDto)).thenReturn(savedQuote);
        when(propertyQuoteRepo.save(savedQuote)).thenReturn(savedQuote);
        when(propertyQuoteMapper.toDto(savedQuote)).thenReturn(inputDto);

        PropertyQuoteDto result = propertyQuoteService.createPropertyQuote(inputDto);
        assertNotNull(result);
        verify(propertyQuoteRepo).save(savedQuote);
    }

    @Test
    public void testGetPropertyQuoteById_Success() {
        PropertyQuote quote = new PropertyQuote();
        quote.setId(1);
        quote.setPropertyInfo("prop-123");

        PropertyQuoteDto dto = new PropertyQuoteDto();
        dto.setId(1);

        when(propertyQuoteRepo.findById(1)).thenReturn(Optional.of(quote));
        when(propertyQuoteMapper.toDto(quote)).thenReturn(dto);

        PropertyQuoteDto result = propertyQuoteService.getPropertyQuoteById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(propertyQuoteRepo).findById(1);
    }

    @Test
    public void testGetPropertyQuoteById_NotFound() {
        when(propertyQuoteRepo.findById(999)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> propertyQuoteService.getPropertyQuoteById(999));

        assertEquals("No PropertyQuote found with id: 999", exception.getMessage());
    }

    @Test
    public void testGetAllPropertyQuotes_Success() {
        PropertyQuote quote1 = new PropertyQuote();
        quote1.setId(1);
        PropertyQuote quote2 = new PropertyQuote();
        quote2.setId(2);

        when(propertyQuoteRepo.findAll()).thenReturn(Arrays.asList(quote1, quote2));
        when(propertyQuoteMapper.toDto(any(PropertyQuote.class)))
                .thenReturn(new PropertyQuoteDto());

        List<PropertyQuoteDto> results = propertyQuoteService.getAllPropertyQuotes();

        assertEquals(2, results.size());
        verify(propertyQuoteRepo).findAll();
    }
}