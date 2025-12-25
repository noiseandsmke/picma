package edu.hcmute.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.client.PropertyInfoClient;
import edu.hcmute.client.PropertyLeadClient;
import edu.hcmute.client.PropertyQuoteClient;
import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.dto.QuoteDto;
import edu.hcmute.entity.ResearchInteraction;
import edu.hcmute.exception.DeepResearchException;
import edu.hcmute.repository.ResearchInteractionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.stringtemplate.v4.ST;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class DeepResearchService {
    private static final String TEMPLATE_NAME = "deep-research.st";
    private static final String STATUS_COMPLETED = "completed";
    private final PropertyLeadClient propertyLeadClient;
    private final PropertyInfoClient propertyInfoClient;
    private final PropertyQuoteClient propertyQuoteClient;
    private final GeminiApiService geminiApiService;
    private final ResearchInteractionRepository interactionRepository;
    private final ObjectMapper objectMapper;

    public DeepResearchService(PropertyLeadClient propertyLeadClient,
                               PropertyInfoClient propertyInfoClient,
                               PropertyQuoteClient propertyQuoteClient,
                               GeminiApiService geminiApiService,
                               ResearchInteractionRepository interactionRepository,
                               ObjectMapper objectMapper) {
        this.propertyLeadClient = propertyLeadClient;
        this.propertyInfoClient = propertyInfoClient;
        this.propertyQuoteClient = propertyQuoteClient;
        this.geminiApiService = geminiApiService;
        this.interactionRepository = interactionRepository;
        this.objectMapper = objectMapper;
    }

    public String generatePrompt(Integer leadId) {
        log.info("### Generate prompt for lead {} ###", leadId);
        PropertyLeadDto lead = propertyLeadClient.getLeadById(leadId);
        if (lead == null) {
            log.warn("~~> lead not found: {}", leadId);
            throw new DeepResearchException("Lead not found: " + leadId);
        }
        PropertyInfoDto propertyInfo = propertyInfoClient.getPropertyInfoById(lead.propertyInfo());
        if (propertyInfo == null) {
            log.warn("~~> property info not found for lead: {}", leadId);
            throw new DeepResearchException("Property Info not found for ID: " + lead.propertyInfo());
        }
        List<QuoteDto> quotes = propertyQuoteClient.getQuotesByLeadId(leadId);
        Map<String, Object> propertyInfoMap = objectMapper.convertValue(propertyInfo, new TypeReference<>() {
        });
        List<Map<String, Object>> quotesList = objectMapper.convertValue(quotes, new TypeReference<>() {
        });
        enrichQuotesWithDetails(quotesList);
        String templateContent = loadTemplate();
        ST st = new ST(templateContent);
        st.add("propertyInfo", propertyInfoMap);
        st.add("quotes", quotesList);
        String renderedPrompt = st.render();
        log.info("~~> generated prompt with length: {}", renderedPrompt.length());
        return renderedPrompt;
    }

    @SuppressWarnings("unchecked")
    private void enrichQuotesWithDetails(List<Map<String, Object>> quotesList) {
        if (quotesList == null) return;
        for (Map<String, Object> quote : quotesList) {
            List<Map<String, Object>> coverages = (List<Map<String, Object>>) quote.get("coverages");
            quote.put("fireLimit", getFireCoverageLimit(coverages));
        }
    }

    private String getFireCoverageLimit(List<Map<String, Object>> coverages) {
        if (coverages == null) return "0";
        for (Map<String, Object> coverage : coverages) {
            Object coverageCode = coverage.get("code");
            if (coverageCode != null && "FIRE".equals(coverageCode.toString())) {
                return String.valueOf(coverage.get("limit"));
            }
        }
        return "0";
    }

    private String loadTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_NAME);
            byte[] bdata = FileCopyUtils.copyToByteArray(resource.getInputStream());
            return new String(bdata, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("~~> failed to load template", e);
            throw new IllegalStateException("Failed to load prompt template: " + TEMPLATE_NAME, e);
        }
    }

    public ResearchInteraction getInteractionByLeadId(Integer leadId) {
        log.info("### Get interaction by lead {} ###", leadId);
        return interactionRepository.findByLeadId(leadId)
                .orElseThrow(() -> new DeepResearchException("No research interaction found for lead ID: " + leadId));
    }

    public Flux<ServerSentEvent<String>> streamResearch(Integer leadId) {
        log.info("### Stream research for lead {} ###", leadId);
        ResearchInteraction interaction = getInteractionByLeadId(leadId);
        return geminiApiService.resumeResearch(interaction.getInteractionId());
    }

    public String initiateResearch(Integer leadId) {
        log.info("### Initiate research for lead {} ###", leadId);
        if (isResearched(leadId)) {
            throw new IllegalStateException("Deep research already performed for lead " + leadId);
        }
        String prompt = generatePrompt(leadId);
        String jsonResponse = geminiApiService.startBackgroundResearch(prompt);
        try {
            Map<String, Object> data = objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
            String id = (String) data.get("id");
            String status = (String) data.get("status");
            if (id != null) {
                ResearchInteraction entity = ResearchInteraction.builder()
                        .leadId(leadId)
                        .interactionId(id)
                        .status(status != null ? status : "created")
                        .created(LocalDateTime.now())
                        .updated(LocalDateTime.now())
                        .build();
                interactionRepository.save(entity);
                log.info("~~> interaction initiated: {}", id);
            }
        } catch (Exception e) {
            log.error("~~> failed to parse initiate response", e);
            throw new DeepResearchException("Failed to initiate research", e);
        }
        return jsonResponse;
    }

    public String getResearchResult(Integer leadId) {
        log.info("### Get research result for lead {} ###", leadId);
        return interactionRepository.findByLeadId(leadId)
                .map(this::processResearchInteraction)
                .orElse(null);
    }

    private String processResearchInteraction(ResearchInteraction interaction) {
        try {
            String json = geminiApiService.getInteraction(interaction.getInteractionId());
            if (json != null) {
                Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {
                });
                String status = (String) data.get("status");
                if (STATUS_COMPLETED.equalsIgnoreCase(status) && !STATUS_COMPLETED.equalsIgnoreCase(interaction.getStatus())) {
                    updateInteractionStatus(interaction, data);
                }
            }
            return json;
        } catch (Exception e) {
            log.warn("~~> failed to get interaction result: {}", e.getMessage());
            return null;
        }
    }

    private void updateInteractionStatus(ResearchInteraction interaction, Map<String, Object> data) {
        interaction.setStatus(STATUS_COMPLETED);
        String updatedStr = (String) data.get("updated");
        interaction.setUpdated(parseUpdatedDate(updatedStr));
        interactionRepository.save(interaction);
        log.info("~~> synced interaction status to completed");
    }

    private LocalDateTime parseUpdatedDate(String updatedStr) {
        if (updatedStr != null) {
            try {
                return ZonedDateTime.parse(updatedStr).toLocalDateTime();
            } catch (Exception e) {
                return LocalDateTime.now();
            }
        }
        return LocalDateTime.now();
    }

    public boolean isResearched(Integer leadId) {
        return interactionRepository.existsByLeadId(leadId);
    }
}