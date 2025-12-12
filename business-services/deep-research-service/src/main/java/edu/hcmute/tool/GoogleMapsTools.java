package edu.hcmute.tool;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class GoogleMapsTools {

    private static final String PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    @Value("${spring.ai.google.genai.api-key:mock-key}")
    private String apiKey;

    @Tool(description = "Verify address and find places using Google Maps Places API. Returns formatted address, lat/long, and place ID. Use this to verify if an address exists and get its coordinates.")
    public String findPlace(String input) {
        if ("mock-key".equals(apiKey)) {
            return STR."{\"warning\": \"No Google Maps API Key provided. Cannot verify address real-time.\", \"input\": \"\{input}\"}";
        }
        try {
            String url = UriComponentsBuilder.fromUriString(PLACES_API_URL)
                    .queryParam("input", input)
                    .queryParam("inputtype", "textquery")
                    .queryParam("fields", "formatted_address,name,geometry,place_id")
                    .queryParam("key", apiKey)
                    .toUriString();
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            if (root.path("status").asText().equals("OK") && root.has("candidates")) {
                return root.path("candidates").toString();
            } else {
                return "No location found or API Error: " + root.path("status").asText();
            }
        } catch (Exception e) {
            return "Error calling Google Maps API: " + e.getMessage();
        }
    }
}