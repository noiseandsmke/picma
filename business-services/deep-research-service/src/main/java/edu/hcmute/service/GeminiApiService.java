package edu.hcmute.service;

import edu.hcmute.model.InteractionRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class GeminiApiService {
    private final WebClient webClient;
    @Value("${gemini.api.agent}")
    private String defaultAgent;

    public GeminiApiService(WebClient geminiWebClient) {
        this.webClient = geminiWebClient;
    }

    public String startBackgroundResearch(String prompt) {
        log.info("### Start background research ###");
        InteractionRequest request = new InteractionRequest();
        request.setInput(prompt);
        request.setAgent(defaultAgent);
        request.setBackground(true);
        InteractionRequest.AgentConfig config = new InteractionRequest.AgentConfig();
        config.setType("deep-research");
        config.setThinkingSummaries("auto");
        request.setAgentConfig(config);
        return webClient.post()
                .uri("/interactions")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public Flux<ServerSentEvent<String>> resumeResearch(String interactionId) {
        log.info("### Resume research stream for {} ###", interactionId);
        ParameterizedTypeReference<ServerSentEvent<String>> type = new ParameterizedTypeReference<>() {
        };
        return webClient.get()
                .uri("/interactions/" + interactionId + "?stream=true&alt=sse")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(type)
                .takeUntil(sse -> {
                    boolean isDoneData = sse.data() != null && sse.data().contains("[DONE]");
                    boolean isDoneEvent = sse.event() != null && sse.event().equals("[DONE]");
                    if (isDoneData || isDoneEvent) {
                        log.info("~~> research stream completed");
                    }
                    return isDoneData || isDoneEvent;
                });
    }

    public String getInteraction(String interactionId) {
        log.info("### Get interaction {} ###", interactionId);
        return webClient.get()
                .uri("/interactions/" + interactionId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}