package edu.hcmute;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.NotificationFeignClient;
import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.repo.PropertyQuoteRepo;
import edu.hcmute.service.PropertyQuoteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteServiceUnitTest {

    @Mock
    private PropertyQuoteRepo propertyQuoteRepo;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private PropertyInfoFeignClient propertyInfoFeignClient;

    @Mock
    private PropertyAgentFeignClient propertyAgentFeignClient;

    @Mock
    private NotificationFeignClient notificationFeignClient;

    @InjectMocks
    private PropertyQuoteServiceImpl propertyQuoteService;

    @BeforeEach
    public void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        propertyQuoteService = new PropertyQuoteServiceImpl(
                propertyQuoteRepo,
                modelMapper,
                propertyInfoFeignClient,
                propertyAgentFeignClient,
                notificationFeignClient,
                objectMapper
        );
    }

    @Test
    public void testCreatePropertyQuote_SendsNotifications() {
        PropertyQuoteDto inputDto = new PropertyQuoteDto();
        inputDto.setPropertyInfo("prop-123");
        inputDto.setUserInfo("user-1");

        PropertyQuote savedQuote = new PropertyQuote();
        savedQuote.setId(10);
        savedQuote.setPropertyInfo("prop-123");
        savedQuote.setUserInfo("user-1");

        when(modelMapper.map(inputDto, PropertyQuote.class)).thenReturn(savedQuote);
        when(propertyQuoteRepo.save(savedQuote)).thenReturn(savedQuote);
        when(modelMapper.map(savedQuote, PropertyQuoteDto.class)).thenReturn(inputDto);

        String propertyInfoJson = """
                {
                    "id": "prop-123",
                    "propertyAddressDto": {
                        "zipCode": "90210"
                    }
                }
                """;
        when(propertyInfoFeignClient.getPropertyInfoById("prop-123")).thenReturn(propertyInfoJson);

        List<Integer> agentIds = Arrays.asList(101, 102);
        when(propertyAgentFeignClient.getAgentsByZipCode("90210")).thenReturn(agentIds);
        PropertyQuoteDto result = propertyQuoteService.createPropertyQuote(inputDto);
        assertNotNull(result);
        verify(notificationFeignClient, times(2)).createNotification(any(NotificationRequestDto.class));

        ArgumentCaptor<NotificationRequestDto> captor = ArgumentCaptor.forClass(NotificationRequestDto.class);
        verify(notificationFeignClient, times(2)).createNotification(captor.capture());

        List<NotificationRequestDto> notifications = captor.getAllValues();
        assertEquals(101, notifications.get(0).getRecipientId());
        assertEquals(102, notifications.get(1).getRecipientId());
        assertEquals("New Property Quote Request", notifications.get(0).getTitle());
    }

    @Test
    public void testCreatePropertyQuote_NoZipCode_NoNotifications() {
        PropertyQuoteDto inputDto = new PropertyQuoteDto();
        inputDto.setPropertyInfo("prop-123");

        PropertyQuote savedQuote = new PropertyQuote();
        savedQuote.setId(10);
        savedQuote.setPropertyInfo("prop-123");

        when(modelMapper.map(inputDto, PropertyQuote.class)).thenReturn(savedQuote);
        when(propertyQuoteRepo.save(savedQuote)).thenReturn(savedQuote);
        when(modelMapper.map(savedQuote, PropertyQuoteDto.class)).thenReturn(inputDto);

        String propertyInfoJson = """
                {
                    "id": "prop-123",
                    "propertyAddressDto": {}
                }
                """;
        when(propertyInfoFeignClient.getPropertyInfoById("prop-123")).thenReturn(propertyInfoJson);
        propertyQuoteService.createPropertyQuote(inputDto);
        verify(propertyAgentFeignClient, never()).getAgentsByZipCode(any());
        verify(notificationFeignClient, never()).createNotification(any());
    }

    @Test
    public void testGetPropertyQuoteById_Success() {
        PropertyQuote quote = new PropertyQuote();
        quote.setId(1);
        quote.setPropertyInfo("prop-123");

        PropertyQuoteDto dto = new PropertyQuoteDto();
        dto.setId(1);

        when(propertyQuoteRepo.findById(1)).thenReturn(Optional.of(quote));
        when(modelMapper.map(quote, PropertyQuoteDto.class)).thenReturn(dto);

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
        when(modelMapper.map(any(PropertyQuote.class), eq(PropertyQuoteDto.class)))
                .thenReturn(new PropertyQuoteDto());

        List<PropertyQuoteDto> results = propertyQuoteService.getAllPropertyQuotes();

        assertEquals(2, results.size());
        verify(propertyQuoteRepo).findAll();
    }

    @Test
    public void testCreatePropertyQuote_FeignClientFailure_ContinuesGracefully() {
        PropertyQuoteDto inputDto = new PropertyQuoteDto();
        inputDto.setPropertyInfo("prop-123");

        PropertyQuote savedQuote = new PropertyQuote();
        savedQuote.setId(10);

        when(modelMapper.map(inputDto, PropertyQuote.class)).thenReturn(savedQuote);
        when(propertyQuoteRepo.save(savedQuote)).thenReturn(savedQuote);
        when(modelMapper.map(savedQuote, PropertyQuoteDto.class)).thenReturn(inputDto);
        when(propertyInfoFeignClient.getPropertyInfoById("prop-123"))
                .thenThrow(new RuntimeException("Service unavailable"));
        PropertyQuoteDto result = propertyQuoteService.createPropertyQuote(inputDto);

        assertNotNull(result);
        verify(notificationFeignClient, never()).createNotification(any());
    }

}