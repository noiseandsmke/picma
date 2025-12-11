package edu.hcmute.controller;

import edu.hcmute.service.ResearchOrchestrator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/deep-research")
@RequiredArgsConstructor
public class DeepResearchController {
    private final ResearchOrchestrator orchestrator;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @ApiResponse(responseCode = "200", description = "SSE Stream Established", content = @Content(mediaType = MediaType.TEXT_EVENT_STREAM_VALUE))
    @Operation(summary = "Stream Deep Research Process", security = @SecurityRequirement(name = "bearerAuth"))
    public SseEmitter streamResearch(
            @Parameter(description = "The ID of the Lead to research", example = "8")
            @RequestParam Integer leadId
    ) {
        SseEmitter emitter = new SseEmitter(10 * 60 * 1000L);
        orchestrator.executeLoop(leadId, emitter);
        return emitter;
    }
}