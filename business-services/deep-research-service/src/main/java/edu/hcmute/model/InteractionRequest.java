package edu.hcmute.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InteractionRequest {
    @JsonProperty("input")
    private String input;

    @JsonProperty("agent")
    private String agent;

    @JsonProperty("background")
    private Boolean background;

    @JsonProperty("stream")
    private Boolean stream;

    @JsonProperty("agent_config")
    private AgentConfig agentConfig;

    @JsonProperty("tools")
    private List<Tool> tools;

    @JsonProperty("previous_interaction_id")
    private String previousInteractionId;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentConfig {
        @JsonProperty("type")
        private String type;

        @JsonProperty("thinking_summaries")
        private String thinkingSummaries;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Tool {
        @JsonProperty("type")
        private String type;
    }
}