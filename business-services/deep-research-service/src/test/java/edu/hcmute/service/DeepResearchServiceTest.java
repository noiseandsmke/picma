package edu.hcmute.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.client.PropertyInfoClient;
import edu.hcmute.client.PropertyLeadClient;
import edu.hcmute.client.PropertyQuoteClient;
import edu.hcmute.dto.*;
import edu.hcmute.model.InteractionResponse;
import edu.hcmute.repository.ResearchInteractionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeepResearchServiceTest {

    @Mock
    private PropertyLeadClient propertyLeadClient;

    @Mock
    private PropertyInfoClient propertyInfoClient;

    @Mock
    private PropertyQuoteClient propertyQuoteClient;

    @Mock
    private GeminiApiService geminiApiService;

    @Mock
    private ResearchInteractionRepository interactionRepository;

    private DeepResearchService deepResearchService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        deepResearchService = new DeepResearchService(
                propertyLeadClient,
                propertyInfoClient,
                propertyQuoteClient,
                geminiApiService,
                interactionRepository,
                objectMapper
        );
    }

    @Test
    void testGeneratePrompt_Success() {
        Long leadId = 1L;
        PropertyLeadDto lead = new PropertyLeadDto(
                leadId,
                "user123",
                "prop123",
                "700000",
                "PENDING",
                "2025-01-15"
        );
        LocationDto location = new LocationDto(
                "123 Nguyen Hue",
                "Ward 1",
                "Ho Chi Minh City"
        );
        AttributesDto attributes = new AttributesDto(
                "CONCRETE",
                2023,
                1,
                10
        );
        ValuationDto valuation = new ValuationDto(
                new BigDecimal("5000000000")
        );
        PropertyInfoDto propertyInfo = new PropertyInfoDto(
                "prop123",
                "user123",
                location,
                attributes,
                valuation
        );
        CoverageDto coverage1 = new CoverageDto("FIRE", new BigDecimal("5000000000"), new BigDecimal("10"));
        CoverageDto coverage2 = new CoverageDto("THEFT", new BigDecimal("1000000000"), new BigDecimal("5"));
        PremiumDto premium = new PremiumDto(
                new BigDecimal("1000000"),
                new BigDecimal("100000"),
                new BigDecimal("1100000")
        );
        QuoteDto quote = new QuoteDto(
                1L,
                leadId,
                "agent123",
                "2025-01-15",
                "123 Nguyen Hue, Ward 1, Ho Chi Minh City",
                "DRAFT",
                Arrays.asList(coverage1, coverage2),
                premium
        );
        List<QuoteDto> quotes = List.of(quote);
        when(propertyLeadClient.getLeadById(leadId)).thenReturn(lead);
        when(propertyInfoClient.getPropertyInfoById("prop123")).thenReturn(propertyInfo);
        when(propertyQuoteClient.getQuotesByLeadId(leadId)).thenReturn(quotes);
        String prompt = deepResearchService.generatePrompt(leadId);
        assertNotNull(prompt);
        assertTrue(prompt.contains("123 Nguyen Hue"));
        assertTrue(prompt.contains("Ward 1"));
        assertTrue(prompt.contains("Ho Chi Minh City"));
        assertTrue(prompt.contains("5000000000"));
        assertTrue(prompt.contains("FIRE"));
        assertTrue(prompt.contains("THEFT"));
    }

    @Test
    void testGeneratePrompt_LeadNotFound() {
        Long leadId = 999L;
        when(propertyLeadClient.getLeadById(leadId)).thenReturn(null);
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            deepResearchService.generatePrompt(leadId);
        });
        assertEquals("Lead not found: 999", exception.getMessage());
    }

    @Test
    void testGeneratePrompt_PropertyInfoNotFound() {
        Long leadId = 1L;
        PropertyLeadDto lead = new PropertyLeadDto(
                leadId,
                "user123",
                "prop999",
                "700000",
                "PENDING",
                "2025-01-15"
        );
        when(propertyLeadClient.getLeadById(leadId)).thenReturn(lead);
        when(propertyInfoClient.getPropertyInfoById("prop999")).thenReturn(null);
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            deepResearchService.generatePrompt(leadId);
        });
        assertEquals("Property Info not found for ID: prop999", exception.getMessage());
    }

    @Test
    void testGetResearchStatus_Success() {
        String interactionId = "interactions/test123";
        InteractionResponse mockResponse = new InteractionResponse();
        mockResponse.setId(interactionId);
        mockResponse.setStatus("completed");
        when(geminiApiService.getInteraction(interactionId)).thenReturn(mockResponse);
        InteractionResponse response = deepResearchService.getResearchStatus(interactionId);
        assertNotNull(response);
        assertEquals("interactions/test123", response.getId());
        assertEquals("completed", response.getStatus());
    }

    @Test
    void testExtractResearchText_Success() {
        InteractionResponse response = new InteractionResponse();
        InteractionResponse.Output output1 = new InteractionResponse.Output();
        output1.setText("First output");
        InteractionResponse.Output output2 = new InteractionResponse.Output();
        output2.setText("Final research report");
        response.setOutputs(Arrays.asList(output1, output2));
        String text = deepResearchService.extractResearchText(response);
        assertEquals("Final research report", text);
    }

    @Test
    void testExtractResearchText_EmptyOutputs() {
        InteractionResponse response = new InteractionResponse();
        response.setOutputs(List.of());
        String text = deepResearchService.extractResearchText(response);
        assertEquals("", text);
    }

    @Test
    void testExtractResearchText_NullResponse() {
        String text = deepResearchService.extractResearchText(null);
        assertEquals("", text);
    }

    @Test
    void testFollowUp_Success() {
        String question = "Can you elaborate on flood risks?";
        String previousInteractionId = "interactions/test123";
        InteractionResponse mockResponse = new InteractionResponse();
        mockResponse.setId("interactions/followup456");
        mockResponse.setStatus("completed");
        when(geminiApiService.createFollowUpInteraction(eq(question), eq(previousInteractionId)))
                .thenReturn(mockResponse);
        InteractionResponse response = deepResearchService.followUp(question, previousInteractionId);
        assertNotNull(response);
        assertEquals("interactions/followup456", response.getId());
        assertEquals("completed", response.getStatus());
    }
}