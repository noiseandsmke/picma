package edu.hcmute.controller;

import edu.hcmute.entity.ResearchInteraction;
import edu.hcmute.service.DeepResearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/deep-research")
@Tag(name = "Deep Research", description = "Property insurance deep research API using Gemini AI")
public class DeepResearchController {
    private final DeepResearchService deepResearchService;

    public DeepResearchController(DeepResearchService deepResearchService) {
        this.deepResearchService = deepResearchService;
    }

    @Operation(
            summary = "Generate research prompt",
            description = "Generate detailed prompt to send to Gemini Deep Research Agent"
    )
    @GetMapping("/prompt/{leadId}")
    public ResponseEntity<String> getPrompt(
            @Parameter(description = "ID of the property lead to research", required = true)
            @PathVariable Integer leadId
    ) {
        String prompt = deepResearchService.generatePrompt(leadId);
        return ResponseEntity.ok(prompt);
    }

    @Operation(
            summary = "Get research interaction by lead ID",
            description = "Get the research interaction details (including ID and status) for a specific lead."
    )
    @GetMapping("/interaction/{leadId}")
    public ResponseEntity<ResearchInteraction> getInteractionByLeadId(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId
    ) {
        ResearchInteraction interaction = deepResearchService.getInteractionByLeadId(leadId);
        return ResponseEntity.ok(interaction);
    }

    @Operation(
            summary = "Initiate Deep Research",
            description = "Start a background deep research process for a lead."
    )
    @PostMapping("/initiate/{leadId}")
    public ResponseEntity<Object> initiateResearch(
            @Parameter(description = "ID of the property lead to research", required = true)
            @PathVariable Integer leadId
    ) {
        if (deepResearchService.isResearched(leadId)) {
            ResearchInteraction existing = deepResearchService.getInteractionByLeadId(leadId);
            return ResponseEntity.status(409).body(existing);
        }
        String response = deepResearchService.initiateResearch(leadId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Stream Deep Research",
            description = "Stream the research process and results for a lead directly from the AI agent."
    )
    @GetMapping(value = "/stream/{leadId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamResearch(
            @Parameter(description = "ID of the property lead to research", required = true)
            @PathVariable Integer leadId
    ) {
        return deepResearchService.streamResearch(leadId);
    }

    @Operation(
            summary = "Get deep research result",
            description = "Get the full result of a deep research interaction for a lead."
    )
    @GetMapping(value = "/result/{leadId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getResearchResult(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId
    ) {
        String result = deepResearchService.getResearchResult(leadId);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Check research status",
            description = "Check if research exists for a lead (returns boolean)."
    )
    @GetMapping("/status/{leadId}")
    public ResponseEntity<Boolean> getResearchStatus(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId
    ) {
        return ResponseEntity.ok(deepResearchService.isResearched(leadId));
    }
}