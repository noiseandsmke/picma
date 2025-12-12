package edu.hcmute.service;

import edu.hcmute.client.PropertyLeadClient;
import edu.hcmute.client.PropertyMgmtClient;
import edu.hcmute.client.PropertyQuoteClient;
import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.dto.QuoteDto;
import edu.hcmute.model.NextAction;
import edu.hcmute.model.ResearchReport;
import edu.hcmute.model.SystemContext;
import edu.hcmute.repo.ResearchReportRepository;
import edu.hcmute.repo.SystemContextRepository;
import edu.hcmute.tool.GoogleMapsTools;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResearchOrchestrator {
    private final ChatClient chatClient;
    private final PropertyMgmtClient propertyMgmtClient;
    private final PropertyQuoteClient propertyQuoteClient;
    private final PropertyLeadClient propertyLeadClient;
    private final ResearchReportRepository reportRepository;
    private final SystemContextRepository contextRepository;
    private final GoogleMapsTools googleMapsTools;

    @Value("classpath:/prompts/research-system-prompt.st")
    private Resource systemPromptResource;

    @Async
    public void executeLoop(Integer leadId, SseEmitter emitter) {
        String sessionId = UUID.randomUUID().toString();
        try {
            String systemPrompt = StreamUtils.copyToString(systemPromptResource.getInputStream(), StandardCharsets.UTF_8);
            PropertyLeadDto leadDto = propertyLeadClient.getLeadById(leadId);
            if (leadDto == null) {
                throw new IllegalArgumentException("Lead not found with id: " + leadId);
            }
            String ownerId = leadDto.userInfo();
            String propertyId = leadDto.propertyInfo();
            if (propertyId == null || propertyId.isBlank()) {
                throw new IllegalArgumentException("Lead does not have a property_info associated: " + leadId);
            }
            PropertyInfoDto propertyInfo = propertyMgmtClient.getProperty(propertyId);
            if (propertyInfo == null) {
                throw new IllegalArgumentException("Property not found with id: " + propertyId);
            }
            List<QuoteDto> quotes = Collections.emptyList();
            try {
                quotes = propertyQuoteClient.getQuotesByLeadId(leadId);
                log.info("Fetched {} quotes for leadId: {}", quotes.size(), leadId);
            } catch (Exception e) {
                log.warn("Could not fetch quotes for leadId: {}", leadId, e);
            }
            String defaultGoal = "Standard Property Deep Research";
            SystemContext context = new SystemContext(sessionId, defaultGoal, propertyInfo, quotes);
            contextRepository.save(context);
            emitter.send(SseEmitter.event().name("init").data("Starting deep research for Lead #" + leadId));
            int step = 0;
            int maxSteps = 4;
            BeanOutputConverter<NextAction> outputConverter = new BeanOutputConverter<>(NextAction.class);
            while (step < maxSteps) {
                try {
                    String userPrompt = context.toPromptString() + "\n\n" + outputConverter.getFormat();
                    String rawResponse = chatClient.prompt()
                            .system(systemPrompt)
                            .user(userPrompt)
                            .options(GoogleGenAiChatOptions.builder()
                                    .temperature(0.3)
                                    .build())
                            .call()
                            .content();
                    log.info("Raw LLM Response: {}", rawResponse);
                    String cleanedJson = extractJsonFromResponse(rawResponse);
                    NextAction action = outputConverter.convert(cleanedJson);
                    if (action.reasoning() != null) {
                        emitter.send(SseEmitter.event().name("thought").data(action.reasoning()));
                        context.addToHistory("STEP " + (step + 1) + " - THOUGHT: " + action.reasoning());
                    }
                    switch (action.type()) {
                        case MAPS -> {
                            emitter.send(SseEmitter.event().name("step").data("Checking Google Maps: " + action.query()));
                            String mapsResult = googleMapsTools.findPlace(action.query());
                            context.addFindings("Maps Result: " + mapsResult);
                            context.addToHistory("ACTION: MAPS completed");
                        }
                        case SEARCH -> {
                            emitter.send(SseEmitter.event().name("step").data("Searching: " + action.query()));
                            String searchSummary = chatClient.prompt()
                                    .user("Search for: " + action.query() + "\n\nProvide a concise summary of key facts.")
                                    .options(GoogleGenAiChatOptions.builder()
                                            .googleSearchRetrieval(true)
                                            .temperature(0.3)
                                            .build())
                                    .call()
                                    .content();
                            context.addFindings("Search Result: " + searchSummary);
                            context.addToHistory("ACTION: SEARCH completed");
                        }
                        case ANSWER -> {
                            emitter.send(SseEmitter.event().name("answer").data(action.answer()));
                            saveReport(propertyId, ownerId, leadId, action.answer());
                            contextRepository.save(context);
                            emitter.complete();
                            log.info("Deep research completed successfully for leadId: {} in {} steps", leadId, step + 1);
                            return;
                        }
                    }
                    contextRepository.save(context);
                    step++;
                } catch (Exception e) {
                    log.error("Error parsing LLM response at step {}: {}", step, e.getMessage());
                    emitter.send(SseEmitter.event().name("error").data("Failed to parse AI response at step " + step));
                    break;
                }
            }
            emitter.send(SseEmitter.event().name("warning").data("Research completed without final answer after " + maxSteps + " steps"));
            emitter.complete();
        } catch (Exception e) {
            log.error("Research loop failed for leadId: {}", leadId, e);
            try {
                emitter.send(SseEmitter.event().name("error").data("Research failed: " + e.getMessage()));
            } catch (IOException _) {
            }
            emitter.completeWithError(e);
        }
    }

    private String extractJsonFromResponse(String response) {
        if (response == null) return "{}";
        String trimmed = response.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();
        int jsonStart = trimmed.indexOf('{');
        int jsonEnd = trimmed.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            return trimmed.substring(jsonStart, jsonEnd + 1);
        }
        return trimmed;
    }

    private void saveReport(String propertyId, String ownerId, Integer leadId, String markdownSummary) {
        ResearchReport report = ResearchReport.builder()
                .propertyId(propertyId)
                .ownerId(ownerId)
                .leadId(leadId)
                .finalSummary(markdownSummary)
                .reportData("{}")
                .build();
        reportRepository.save(report);
        log.info("Saved research report for leadId: {}", leadId);
    }
}