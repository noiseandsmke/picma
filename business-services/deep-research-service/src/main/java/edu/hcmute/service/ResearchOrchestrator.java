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
import org.springframework.ai.chat.client.AdvisorParams;
import org.springframework.ai.chat.client.ChatClient;
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
            } catch (Exception e) {
                log.warn("Could not fetch quotes for leadId: {}", leadId, e);
            }
            String defaultGoal = "Perform comprehensive property analysis including: 1) Verify administrative boundaries for Ho Chi Minh City ward mergers, 2) Assess geospatial risks (flood and fire), 3) Calculate valuation and land clearance compensation, 4) Evaluate agent quotes.";
            SystemContext context = new SystemContext(sessionId, defaultGoal, propertyInfo, quotes);
            contextRepository.save(context);
            emitter.send(SseEmitter.event().name("init").data("Starting deep research for Lead #" + leadId));
            int step = 0;
            int maxSteps = 10;
            while (step < maxSteps) {
                NextAction action = chatClient.prompt()
                        .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
                        .system(systemPrompt)
                        .user(context.toPromptString())
                        .call()
                        .entity(NextAction.class);
                if (action.reasoning() != null) {
                    emitter.send(SseEmitter.event().name("thought").data(action.reasoning()));
                    context.addToHistory("THOUGHT: " + action.reasoning());
                }
                switch (action.type()) {
                    case MAPS -> {
                        emitter.send(SseEmitter.event().name("step").data("Checking Google Maps: " + action.query()));
                        String mapsResult = googleMapsTools.findPlace(action.query());
                        context.addFindings("Maps Result for '" + action.query() + "': " + mapsResult);
                        context.addToHistory("ACTION: MAPS '" + action.query() + "'");
                    }
                    case SEARCH -> {
                        emitter.send(SseEmitter.event().name("step").data("Searching: " + action.query()));
                        String searchSummary = chatClient.prompt()
                                .user("Search for the following and summarize the key facts: " + action.query())
                                .options(GoogleGenAiChatOptions.builder()
                                        .googleSearchRetrieval(true)
                                        .build())
                                .call()
                                .content();
                        String finding = "Search Result for '" + action.query() + "': " + searchSummary;
                        context.addFindings(finding);
                        context.addToHistory("ACTION: SEARCH '" + action.query() + "' -> Found: " + searchSummary);
                    }
                    case ANSWER -> {
                        emitter.send(SseEmitter.event().name("answer").data(action.answer()));
                        saveReport(propertyId, ownerId, leadId, action.answer());
                        contextRepository.save(context);
                        emitter.complete();
                        return;
                    }
                }
                contextRepository.save(context);
                step++;
            }
            emitter.send(SseEmitter.event().name("warning").data("Research completed without final answer after " + maxSteps + " steps"));
            emitter.complete();
        } catch (Exception e) {
            log.error("Research loop failed", e);
            try {
                emitter.send(SseEmitter.event().name("error").data("Research failed: " + e.getMessage()));
            } catch (IOException _) {
            }
            emitter.completeWithError(e);
        }
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
    }
}