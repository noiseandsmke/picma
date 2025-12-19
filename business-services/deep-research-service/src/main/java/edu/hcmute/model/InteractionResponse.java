package edu.hcmute.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InteractionResponse {
    @JsonProperty("id")
    private String id;

    @JsonProperty("status")
    private String status;

    @JsonProperty("outputs")
    private List<Output> outputs;

    @JsonProperty("error")
    private ErrorDetail error;

    @JsonProperty("create_time")
    private String createTime;

    @JsonProperty("update_time")
    private String updateTime;

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Output {
        @JsonProperty("text")
        private String text;

        @JsonProperty("type")
        private String type;

        @JsonProperty("citations")
        private List<Citation> citations;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Citation {
        @JsonProperty("start_index")
        private Integer startIndex;

        @JsonProperty("end_index")
        private Integer endIndex;

        @JsonProperty("url")
        private String url;

        @JsonProperty("title")
        private String title;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        @JsonProperty("code")
        private Integer code;

        @JsonProperty("message")
        private String message;
    }
}